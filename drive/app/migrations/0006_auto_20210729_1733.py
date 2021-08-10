# Generated by Django 3.2.4 on 2021-07-29 12:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_auto_20200409_1133'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='files',
            name='file_desc',
        ),
        migrations.RemoveField(
            model_name='files',
            name='folder_id',
        ),
        migrations.CreateModel(
            name='folder',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('folder_name', models.TextField()),
                ('folder_date', models.DateField()),
                ('folder_starred', models.BooleanField()),
                ('folder_link', models.TextField()),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.folder')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.user')),
            ],
        ),
        migrations.AddField(
            model_name='files',
            name='folder',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='app.folder'),
        ),
    ]
