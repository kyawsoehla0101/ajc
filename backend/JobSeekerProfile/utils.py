import random
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
import datetime
from .models import JobseekerProfile



def send_verification_code(user):
    """
    Sends OTP to the user's email using a clean HTML email template.
    Returns the OTP code as string.
    """
    otp_code = str(random.randint(100000,999999))  # always 6 digits
    subject = "Your Email Verification Code"
    jobseeker = user.email.split('@')[0] #user.email.split('@')[0]
    

    # Plain text fallback
    text_content = (
        f"Hello {jobseeker},\n\n"
        f"Your OTP verification code is: {otp_code}\n"
        f"This code expires in 5 minutes.\n\n"
        f"If you did not request this, please ignore this email."
    )

    # HTML Version
    html_content = render_to_string(
        "emails/otp_verification.html",
        {
            "username": jobseeker,
            "otp_code": otp_code,
            "year": datetime.datetime.now().year,
        },
    )

    # Send email
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)

    return otp_code
