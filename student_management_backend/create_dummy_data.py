import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_backend.settings')
django.setup()

from api.models import User, Subject, Class

print("--- Creating Dummy Data ---")

# 1. Create Teacher
teacher_email = 'maths@teacher.com'
if not User.objects.filter(email=teacher_email).exists():
    teacher = User.objects.create_user(
        email=teacher_email,
        password='password123',
        name='Maths Teacher',
        role='teacher',
        subject='Mathematics'
    )
    print(f"✅ Created Teacher: {teacher.name} ({teacher.email})")
else:
    teacher = User.objects.get(email=teacher_email)
    print(f"ℹ️ Teacher already exists: {teacher.name}")

# 2. Create Class 9A
if not Class.objects.filter(class_number=9, division='A').exists():
    cls = Class.objects.create(
        class_number=9,
        division='A',
        class_teacher=teacher # Assign as class teacher too for simplicity, though not required for subject teacher
    )
    print(f"✅ Created Class: 9A")
else:
    cls = Class.objects.get(class_number=9, division='A')
    print(f"ℹ️ Class 9A already exists")

# 3. Assign Subject 'Mathematics' for 9A to Teacher
if not Subject.objects.filter(name='Mathematics', class_name='9A').exists():
    Subject.objects.create(
        name='Mathematics',
        class_name='9A',
        class_teacher=teacher
    )
    print(f"✅ Assigned Subject 'Mathematics' (9A) to {teacher.name}")
else:
    print(f"ℹ️ Subject 'Mathematics' (9A) already assigned")

# 4. Create Student
student_email = 'student@9a.com'
if not User.objects.filter(email=student_email).exists():
    student = User.objects.create_user(
        email=student_email,
        password='password123',
        name='Student One',
        role='student',
        className='9',
        division='A'
    )
    print(f"✅ Created Student: {student.name} ({student.email})")
else:
    print(f"ℹ️ Student already exists")

print("\n-----------------------------")
print("Login Credentials:")
print(f"Teacher: {teacher_email} / password123")
print("-----------------------------")
