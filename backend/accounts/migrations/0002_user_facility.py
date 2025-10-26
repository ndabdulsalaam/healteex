from __future__ import annotations

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("inventory", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="facility",
            field=models.ForeignKey(
                blank=True,
                help_text="Facility associated with the user, if applicable.",
                null=True,
                on_delete=models.SET_NULL,
                related_name="users",
                to="inventory.facility",
            ),
        ),
    ]
