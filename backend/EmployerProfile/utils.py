from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from email.utils import formataddr
import datetime

def send_verification_email(request, user):
    # Create uid + token
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    # Build absolute URL
    verify_url = request.build_absolute_uri(
        reverse(
            'employer-emailverifypage',
            kwargs={'uidb64': uid, 'token': token}
        )
    )
    subject = "Verify Your Employer Account"
    # Plain text fallback
    text_content = (
        f"Hello {user.email},\n\n"
        f"Please verify your employer account using the link below:\n"
        f"{verify_url}\n\n"
        f"If you didn't request this, you can ignore this email."
    )

    # HTML Email Content
    html_content = render_to_string(
        "emails/employer_email_verify.html",
        {
            "email": user.email,
            "verify_url": verify_url,
            "year": datetime.datetime.now().year,
        },
    )
    from_email = formataddr((settings.EMAIL_SENDER_NAME, settings.DEFAULT_FROM_EMAIL))
    email = EmailMultiAlternatives(
        subject,
        text_content,
        from_email,
        [user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

