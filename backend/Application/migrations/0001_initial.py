import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('JobSeekerProfile', '0006_merge_20251023_0952'),

        ('JobSeekerProfile', '0004_alter_resume_file'),
        ('Jobs', '0009_alter_jobs_location'),


        ('JobSeekerProfile', '0003_alter_resume_profile'),
        ('Jobs', '0009_alter_jobs_location'),

    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(blank=True, choices=[('P', 'Pending'), ('AC', 'Accept'), ('RJ', 'Reject')], default='P', max_length=50, null=True)),
                ('cover_letter_text', models.TextField(null=True)),
                ('applied_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='Jobs.jobs')),
                ('job_seeker_profile', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='JobSeekerProfile.jobseekerprofile')),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('job_seeker_profile', 'job'), name='unique_application_per_jobseeker_job')],
            },
        ),
        migrations.CreateModel(
            name='SaveJob',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('job', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Jobs.jobs')),
                ('profile', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='saved_jobs', to='JobSeekerProfile.jobseekerprofile')),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('profile', 'job'), name='unique_save_job_per_jobseeker_job')],
            },
        ),
    ]
