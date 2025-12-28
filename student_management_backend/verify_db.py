import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_backend.settings')
django.setup()

from api.models import User, Subject, Class

print("--- Database Verification ---")

teachers = User.objects.filter(role='teacher')
print(f"Total Teachers: {teachers.count()}")

for teacher in teachers:
    print(f"\nTeacher: {teacher.name} (ID: {teacher.id})")
    subjects = Subject.objects.filter(class_teacher=teacher)
    if subjects.exists():
        print(f"  Subjects taught: {list(subjects.values_list('name', 'class_name'))}")
        for sub in subjects:
            # Check if class exists
            import re
            match = re.match(r"(\d+)([A-Z]+)", sub.class_name)
            if match:
                c_num = int(match.group(1))
                c_div = match.group(2)
                try:
                    cls = Class.objects.get(class_number=c_num, division=c_div)
                    print(f"    -> Linked Class found: {cls} (ID: {cls.id})")
                except Class.DoesNotExist:
                    print(f"    -> ⚠️ Class {sub.class_name} NOT found in Class model")
            else:
                print(f"    -> ⚠️ Invalid class name format: {sub.class_name}")
    else:
        print("  No subjects assigned.")

print("\n-----------------------------")
