# Generated by Django 5.2.3 on 2025-07-12 23:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_alter_track_audio_file_alter_track_cover_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='track',
            name='audio_file',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='track',
            name='cover_image',
            field=models.URLField(blank=True, null=True),
        ),
    ]
