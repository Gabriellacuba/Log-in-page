"""
Email Utility Module

This module provides functionality for sending emails, particularly
for the password reset feature. In a production environment, this would
integrate with a proper email service like SendGrid, Mailgun, or AWS SES.

For demonstration purposes, this just prints the emails to the console
and returns success.
"""

import logging
from ..config.settings import settings

logger = logging.getLogger(__name__)

async def send_password_reset_email(email: str, token: str) -> bool:
    """
    Sends a password reset email with a reset link
    
    Args:
        email: The recipient's email address
        token: The password reset token
        
    Returns:
        bool: True if email is sent successfully
    """
    # In a production environment, this would actually send an email
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    # Log the email that would be sent
    logger.info(f"\n{'='*50}")
    logger.info(f"SENDING PASSWORD RESET EMAIL")
    logger.info(f"{'='*50}")
    logger.info(f"To: {email}")
    logger.info(f"Subject: Password Reset Request")
    logger.info(f"Body:")
    logger.info(f"Hello,")
    logger.info(f"You have requested to reset your password.")
    logger.info(f"Please click on the following link to reset your password:")
    logger.info(f"{reset_url}")
    logger.info(f"If you did not request this, please ignore this email.")
    logger.info(f"{'='*50}\n")
    
    # In a real implementation, this would return the actual send status
    return True 