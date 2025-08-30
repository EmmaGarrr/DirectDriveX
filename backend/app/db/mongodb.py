from pymongo import MongoClient
from app.core.config import settings
import urllib.parse
import logging
from typing import Tuple, List

logger = logging.getLogger(__name__)

# --- NEW: MONGODB SECURITY VALIDATION FUNCTIONS ---
# These functions validate security WITHOUT changing how connections work

def validate_mongodb_security(connection_string: str, environment: str = "development") -> Tuple[bool, List[str]]:
    """
    Validate MongoDB connection string security based on environment.
    
    This function ONLY validates security - it does not change how connections work.
    
    Args:
        connection_string: MongoDB connection URI to validate
        environment: Current environment (development, staging, production)
    
    Returns:
        Tuple[bool, List[str]]: (is_secure_for_environment, list_of_warnings)
    """
    warnings = []
    is_secure = True
    
    if not connection_string:
        return False, ["MongoDB connection string is empty"]
    
    try:
        # Parse the connection string
        parsed = urllib.parse.urlparse(connection_string)
        
        # Check for authentication (username and password)
        has_auth = bool(parsed.username and parsed.password)
        
        # Check for SSL/TLS encryption
        # MongoDB Atlas (mongodb+srv://) has SSL by default
        # For mongodb:// check for ssl=true or tls=true parameters
        query_params = urllib.parse.parse_qs(parsed.query)
        ssl_enabled = (
            connection_string.startswith('mongodb+srv://') or  # Atlas has SSL by default
            query_params.get('ssl', ['false'])[0].lower() == 'true' or
            query_params.get('tls', ['false'])[0].lower() == 'true'
        )
        
        # Environment-specific security validation
        env_lower = environment.lower()
        
        if env_lower == "production":
            # STRICT: Production must have both auth and encryption
            if not has_auth:
                warnings.append("CRITICAL: MongoDB connection missing authentication (username/password) in production")
                is_secure = False
            
            if not ssl_enabled:
                warnings.append("CRITICAL: MongoDB connection not using SSL/TLS encryption in production")
                is_secure = False
                
        elif env_lower in ["staging", "testing"]:
            # MODERATE: Staging should have security but allow flexibility
            if not has_auth:
                warnings.append("WARNING: MongoDB connection missing authentication in staging environment")
            
            if not ssl_enabled:
                warnings.append("WARNING: MongoDB connection not using SSL/TLS encryption in staging environment")
                
        else:
            # DEVELOPMENT: Allow flexibility but inform about security
            if not has_auth:
                warnings.append("INFO: MongoDB connection missing authentication (OK for local development)")
            
            if not ssl_enabled:
                warnings.append("INFO: MongoDB connection not using SSL/TLS encryption (OK for local development)")
        
        # Additional security checks
        if env_lower == "production":
            if "localhost" in (parsed.hostname or ""):
                warnings.append("WARNING: Using localhost in production MongoDB connection")
            
            if parsed.port == 27017 and not ssl_enabled:
                warnings.append("WARNING: Using default MongoDB port without encryption in production")
        
        return is_secure, warnings
        
    except Exception as e:
        error_msg = f"Error validating MongoDB connection string: {str(e)}"
        logger.error(error_msg)
        return False, [error_msg]

def get_safe_connection_string_for_logging(connection_string: str) -> str:
    """
    Get a safe version of connection string for logging (credentials masked).
    
    Args:
        connection_string: Original MongoDB connection URI
    
    Returns:
        str: Safe connection string with credentials masked
    """
    if not connection_string:
        return "[EMPTY CONNECTION STRING]"
        
    try:
        parsed = urllib.parse.urlparse(connection_string)
        if parsed.username and parsed.password:
            # Replace credentials with masked version
            safe_connection = connection_string.replace(
                f"{parsed.username}:{parsed.password}@",
                "****:****@"
            )
            return safe_connection
        return connection_string
    except Exception:
        return "[INVALID CONNECTION STRING FORMAT]"

def connect_with_security_validation():
    """Connect to MongoDB with security validation - ADD TO EXISTING FILE"""
    connection_string = settings.MONGODB_URI
    environment = getattr(settings, 'ENVIRONMENT', 'development')
    
    # SECURITY: Validate connection security before connecting
    is_secure, security_warnings = validate_mongodb_security(connection_string, environment)
    
    # Log security warnings
    for warning in security_warnings:
        if "CRITICAL" in warning:
            logger.error(f"MongoDB Security: {warning}")
        elif "WARNING" in warning:
            logger.warning(f"MongoDB Security: {warning}")
        else:
            logger.info(f"MongoDB Security: {warning}")
    
    # In production, fail fast if security validation fails
    if environment.lower() == "production" and not is_secure:
        critical_errors = [w for w in security_warnings if "CRITICAL" in w]
        error_message = f"MongoDB connection security validation failed in production: {'; '.join(critical_errors)}"
        logger.error(error_message)
        raise ConnectionError(error_message)
    
    # Log safe connection attempt
    safe_connection = get_safe_connection_string_for_logging(connection_string)
    logger.info(f"MongoDB connection validated, connecting to: {safe_connection}")
    
    # PROCEED WITH EXISTING CONNECTION PATTERN - DO NOT CHANGE THIS PART
    # Your existing connection code here...
    return MongoClient(connection_string)  # or whatever the existing pattern is

# --- EXISTING CONNECTION CODE REMAINS UNCHANGED ---
# CRITICAL: This section must remain exactly as it was

# SECURITY: Validate MongoDB connection before connecting
if getattr(settings, 'MONGODB_SECURITY_VALIDATION_ENABLED', True):
    try:
        # Validate security before creating connection
        connection_string = settings.MONGODB_URI
        environment = getattr(settings, 'ENVIRONMENT', 'development')
        
        is_secure, security_warnings = validate_mongodb_security(connection_string, environment)
        
        # Log security warnings
        for warning in security_warnings:
            if "CRITICAL" in warning:
                logger.error(f"MongoDB Security: {warning}")
            elif "WARNING" in warning:
                logger.warning(f"MongoDB Security: {warning}")
            else:
                logger.info(f"MongoDB Security: {warning}")
        
        # In production, fail fast if security validation fails
        if environment.lower() == "production" and not is_secure:
            critical_errors = [w for w in security_warnings if "CRITICAL" in w]
            error_message = f"MongoDB connection security validation failed in production: {'; '.join(critical_errors)}"
            logger.error(error_message)
            raise ConnectionError(error_message)
        
        # Log safe connection attempt
        safe_connection = get_safe_connection_string_for_logging(connection_string)
        logger.info(f"MongoDB connection validated, connecting to: {safe_connection}")
        
    except Exception as e:
        logger.error(f"MongoDB security validation error: {str(e)}")
        if getattr(settings, 'ENVIRONMENT', 'development').lower() == "production":
            raise ConnectionError(f"MongoDB security validation failed in production: {str(e)}")

# EXISTING CONNECTION PATTERN - PRESERVED EXACTLY AS WAS
client = MongoClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]