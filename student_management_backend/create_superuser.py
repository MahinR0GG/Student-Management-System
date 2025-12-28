import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_backend.settings')
django.setup()

from api.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser(
        email='admin@example.com',
        password='admin123',
        name='Admin',
        role='admin'
    )
    print("✅ Superuser created successfully!")
    print("Email: admin@example.com")
    print("Password: admin123")
else:
    print("⚠️ Superuser already exists!")
