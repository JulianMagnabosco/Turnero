# Generated by Django 5.1.7 on 2025-04-24 20:31

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inicio', '0004_remove_line_users_perfil'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Perfil',
            new_name='Profile',
        ),
    ]
