# jobs/apps.py   <-- make sure the FOLDER is named `jobs` (all lowercase)
from django.apps import AppConfig

class JobsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Jobs"              # <-- must be the python package path, lowercase
    verbose_name = "Jobs"

    def ready(self):
        from . import signals   # <-- safer than hard-coding 'jobs.signals'
