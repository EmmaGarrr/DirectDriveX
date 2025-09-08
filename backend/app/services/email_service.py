import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging
from pathlib import Path
import os

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def load_email_template(template_name: str) -> str:
        """Load HTML email template"""
        try:
            # Get the directory where this file is located
            current_dir = Path(__file__).parent
            template_path = current_dir.parent / "templates" / "email_templates" / f"{template_name}.html"
            
            if not template_path.exists():
                logger.error(f"Email template not found: {template_path}")
                return ""
                
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error loading email template: {e}")
            return ""

    @staticmethod
    def _create_plain_text_content(email: str, reset_token: str, username: str, reset_url: str) -> str:
        """Create plain text version of the email"""
        return f"""
Hello {username or 'User'},

You have requested to reset your password for your DirectDrive account.

To reset your password, please click the following link:
{reset_url}

This link will expire in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes for your security.

If you didn't request this password reset, please ignore this email. Your account is secure and no action is required.

If the link above doesn't work, copy and paste it into your browser.

Best regards,
The DirectDrive Team

---
© 2024 DirectDrive. All rights reserved.
This email was sent to {email}.
        """.strip()

    @staticmethod
    async def _send_plain_text_email(email: str, reset_token: str, username: str = None):
        """Fallback method to send plain text email"""
        try:
            if not all([settings.SMTP_HOST, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
                return False
                
            # Create reset link
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL or settings.SMTP_USERNAME}>"
            msg['To'] = email
            msg['Subject'] = "Password Reset Request - DirectDrive"
            
            # Create plain text content
            text_content = EmailService._create_plain_text_content(email, reset_token, username, reset_url)
            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            
            # Send email
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                start_tls=True,
                use_tls=False
            )
            
            logger.info(f"Plain text password reset email sent to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send plain text password reset email to {email}: {e}")
            return False

    @staticmethod
    async def send_password_reset_email(email: str, reset_token: str, username: str = None):
        """Send password reset email to user"""
        try:
            if not all([settings.SMTP_HOST, settings.SMTP_USERNAME, settings.SMTP_PASSWORD]):
                logger.warning("SMTP not configured, skipping email send")
                return False
                
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL or settings.SMTP_USERNAME}>"
            msg['To'] = email
            msg['Subject'] = "🔐 Password Reset Request - DirectDrive"
            
            # Create reset link
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            
            # Load HTML template
            html_template = EmailService.load_email_template("password_reset")
            
            if not html_template:
                logger.error("Failed to load HTML template, falling back to plain text")
                # Fallback to plain text if template loading fails
                return await EmailService._send_plain_text_email(email, reset_token, username)
            
            # Replace placeholders in HTML template
            html_content = html_template.replace("{{ username }}", username or "User")
            html_content = html_content.replace("{{ reset_url }}", reset_url)
            html_content = html_content.replace("{{ expire_minutes }}", str(settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES))
            html_content = html_content.replace("{{ email }}", email)
            
            # Create plain text fallback
            text_content = EmailService._create_plain_text_content(email, reset_token, username, reset_url)
            
            # Attach both HTML and plain text versions
            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            # Send email
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                start_tls=True,
                use_tls=False
            )
            
            logger.info(f"Password reset email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {e}")
            return False
