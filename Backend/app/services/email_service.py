"""Email service using Gmail SMTP."""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email_otp(to_email: str, otp: str, purpose: str = "register") -> bool:
    """Send OTP email via Gmail SMTP."""
    
    # Get Gmail credentials from environment
    gmail_user = os.getenv("GMAIL_USER")  # Your Gmail address
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD")  # 16-character app password
    
    if not gmail_user or not gmail_app_password:
        # Fallback: print to console for development
        print(f"\n{'='*60}")
        print(f"OTP EMAIL (Development Mode)")
        print(f"{'='*60}")
        print(f"To: {to_email}")
        print(f"Purpose: {purpose}")
        print(f"OTP Code: {otp}")
        print(f"{'='*60}\n")
        print("Note: Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send real emails")
        return True
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        
        if purpose == "reset":
            msg['Subject'] = "Your Traveloop Password Reset Code"
        else:
            msg['Subject'] = "Your Traveloop Verification Code"
        
        msg['From'] = gmail_user
        msg['To'] = to_email
        
        # Create HTML content
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
                <h2 style="margin: 0; font-size: 28px;">Traveloop</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Adventure Starts Here</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #333; margin-top: 0;">Verification Code</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.5;">
                    Your verification code is:
                </p>
                
                <div style="background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="color: #667eea; font-size: 42px; letter-spacing: 8px; margin: 0; font-weight: bold;">
                        {otp}
                    </h1>
                </div>
                
                <p style="color: #999; font-size: 14px;">
                    This code will expire in 10 minutes.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>Traveloop - Plan Your Next Adventure</p>
            </div>
        </body>
        </html>
        """
        
        # Attach HTML content
        msg.attach(MIMEText(html, 'html'))
        
        # Connect to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_app_password)
        
        # Send email
        server.sendmail(gmail_user, to_email, msg.as_string())
        server.quit()
        
        print(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"\nOTP for {to_email}: {otp}")
        return False


def send_welcome_email(to_email: str, first_name: str) -> bool:
    """Send welcome email after registration."""
    
    gmail_user = os.getenv("GMAIL_USER")
    gmail_app_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not gmail_user or not gmail_app_password:
        print(f"\nWelcome email would be sent to {first_name} ({to_email})\n")
        return True
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Welcome to Traveloop!"
        msg['From'] = gmail_user
        msg['To'] = to_email
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
                <h2 style="margin: 0; font-size: 28px;">Welcome to Traveloop!</h2>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #333;">Hi {first_name},</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.5;">
                    Your account has been successfully created!<br><br>
                    Start planning your next adventure today with Traveloop.
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_user, gmail_app_password)
        server.sendmail(gmail_user, to_email, msg.as_string())
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
        return False
