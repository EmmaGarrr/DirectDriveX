from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth_service import create_access_token, verify_password, get_password_hash, get_current_user
from app.models.user import UserCreate, UserInDB, Token, UserProfileResponse, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
from app.models.google_oauth import GoogleAuthRequest, GoogleCallbackRequest, GoogleAuthResponse, GoogleCallbackResponse
from app.services.storage_service import StorageService
from app.services.email_service import EmailService
from app.services.password_reset_service import PasswordResetService
from app.services.google_oauth_service import GoogleOAuthService
from app.db.mongodb import db
from datetime import timedelta, datetime
import time

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"email": form_data.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is a Google OAuth user without password
    if user.get("is_google_user") and user.get("hashed_password") is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are logged in with Google or you have forgotten your password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password for non-Google users or Google users with passwords
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=1440)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate):
    db_user = db.users.find_one({"email": user.email})
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    
    # In MongoDB, the primary key is _id. We'll use the email as the _id for simplicity.
    user_dict["_id"] = user.email 
    
    db.users.insert_one(user_dict)
    
    return UserInDB(**user_dict)

@router.get("/users/me", response_model=UserProfileResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    # Get full user document from database
    user_doc = db.users.find_one({"_id": current_user.id}, {"hashed_password": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Calculate storage data
    storage_data = StorageService.calculate_user_storage(current_user.id)
    
    # Build enhanced profile response
    return StorageService.build_user_profile_response(user_doc, storage_data)

# --- NEW: PASSWORD RESET ENDPOINTS ---

# Simple rate limiting for forgot password
FORGOT_PASSWORD_ATTEMPTS = {}

@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(request: ForgotPasswordRequest, http_request: Request):
    """Request password reset for user account"""
    try:
        # Rate limiting
        client_ip = http_request.client.host
        current_time = time.time()
        
        if client_ip in FORGOT_PASSWORD_ATTEMPTS:
            last_attempt, count = FORGOT_PASSWORD_ATTEMPTS[client_ip]
            if current_time - last_attempt < 3600:  # 1 hour window
                if count >= 5:  # Max 5 attempts per hour
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Too many password reset attempts. Please try again later."
                    )
                FORGOT_PASSWORD_ATTEMPTS[client_ip] = (last_attempt, count + 1)
            else:
                FORGOT_PASSWORD_ATTEMPTS[client_ip] = (current_time, 1)
        else:
            FORGOT_PASSWORD_ATTEMPTS[client_ip] = (current_time, 1)
        
        # Check if user exists
        user = db.users.find_one({"email": request.email})
        if not user:
            # Don't reveal if email exists or not for security
            return PasswordResetResponse(
                message="If an account with that email exists, a password reset link has been sent.",
                email=request.email
            )
        
        # Generate reset token
        reset_token = await PasswordResetService.create_reset_token(request.email)
        if not reset_token:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate reset token"
            )
        
        # Send email
        email_sent = await EmailService.send_password_reset_email(
            email=request.email,
            reset_token=reset_token,
            username=user.get("email", "").split("@")[0]
        )
        
        if not email_sent:
            # Log the issue but don't reveal to user
            print(f"Failed to send password reset email to {request.email}")
        
        return PasswordResetResponse(
            message="If an account with that email exists, a password reset link has been sent.",
            email=request.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in forgot_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using reset token"""
    try:
        # Validate token
        reset_data = await PasswordResetService.validate_reset_token(request.reset_token)
        if not reset_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Check if user still exists
        user = db.users.find_one({"email": reset_data["email"]})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account not found"
            )
        
        # Hash new password
        hashed_password = get_password_hash(request.new_password)
        
        # Update user password and reset Google OAuth flags
        db.users.update_one(
            {"email": reset_data["email"]},
            {"$set": {
                "hashed_password": hashed_password,
                "is_google_user": False  # Allow manual login after password reset
            }}
        )
        
        # Mark token as used
        await PasswordResetService.mark_token_used(request.reset_token)
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in reset_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting your password"
        )

@router.post("/change-password")
async def change_password(
    password_data: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Change password for authenticated user"""
    try:
        # Verify current password
        if not verify_password(password_data["current_password"], current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        hashed_password = get_password_hash(password_data["new_password"])
        
        # Update password
        db.users.update_one(
            {"email": current_user.email},
            {"$set": {"hashed_password": hashed_password}}
        )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in change_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while changing your password"
        )

# --- NEW: GOOGLE OAUTH ENDPOINTS ---

@router.get("/google/auth", response_model=GoogleAuthResponse)
async def google_auth():
    """Initiate Google OAuth flow"""
    try:
        # Validate OAuth configuration
        if not GoogleOAuthService.validate_oauth_config():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth is not properly configured"
            )
        
        auth_url = GoogleOAuthService.get_oauth_url()
        return GoogleAuthResponse(auth_url=auth_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google OAuth URL: {str(e)}"
        )

@router.post("/google/callback", response_model=GoogleCallbackResponse)
async def google_callback(request: GoogleCallbackRequest):
    """Handle Google OAuth callback"""
    try:
        # Validate OAuth configuration
        if not GoogleOAuthService.validate_oauth_config():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth is not properly configured"
            )
        
        # Exchange code for tokens
        token_info = await GoogleOAuthService.exchange_code_for_tokens(request.code)
        
        # Get user information
        user_info = await GoogleOAuthService.get_user_info(token_info["access_token"])
        
        # Authenticate or create user
        user = await GoogleOAuthService.authenticate_or_create_user(user_info)
        
        # Create JWT token
        access_token = await GoogleOAuthService.create_auth_token(user)
        
        return GoogleCallbackResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "email": user["email"],
                "name": user.get("name", ""),
                "picture": user.get("picture")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth authentication failed: {str(e)}"
        )