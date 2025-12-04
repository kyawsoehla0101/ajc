# Accounts/models.py
from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager

#this is custom user manager for custom user model
class CustomUserManager(BaseUserManager):
    use_in_migrations = True
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)  # <-- no username
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)
#end of custom user manager

class CustomUser(AbstractUser):                          
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None # completely remove username
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=(("employer", "Employer"), ("jobseeker", "Jobseeker")),
        default="jobseeker",
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # no username required
    objects = CustomUserManager() # specify the custom manager

    def __str__(self):
        return self.email


