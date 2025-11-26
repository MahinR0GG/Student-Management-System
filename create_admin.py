import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_backend.settings')
django.setup()

from api.models import User

# Delete existing admin if any
User.objects.filter(email='admin@example.com').delete()

# Create superuser
admin = User.objects.create_superuser(
    email='admin@example.com',
    password='admin123',
    name='Admin User'
)

print(f"✅ Admin user created successfully!")
print(f"Email: {admin.email}")
print(f"Password: admin123")
