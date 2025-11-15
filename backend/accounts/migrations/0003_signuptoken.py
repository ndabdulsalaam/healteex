from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_facility"),
    ]

    operations = [
        migrations.CreateModel(
            name="SignupToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(max_length=254)),
                ("role", models.CharField(choices=[("pharmacist", "Pharmacist"), ("policy_maker", "Policy Maker"), ("facility_admin", "Facility Administrator"), ("super_admin", "Super Administrator")], max_length=32)),
                ("token", models.CharField(max_length=64, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField()),
                ("is_used", models.BooleanField(default=False)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="signuptoken",
            index=models.Index(fields=["email", "role"], name="accounts_si_email_9169c9_idx"),
        ),
        migrations.AddIndex(
            model_name="signuptoken",
            index=models.Index(fields=["token"], name="accounts_si_token_ebf180_idx"),
        ),
    ]
