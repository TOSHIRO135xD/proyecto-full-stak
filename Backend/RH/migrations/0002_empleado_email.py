from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('RH', '0001_initial')]

    operations = [
        migrations.AddField(
            model_name='empleado',
            name='email',
            field=models.EmailField(default='', max_length=254),
            preserve_default=False,
        ),
    ]
