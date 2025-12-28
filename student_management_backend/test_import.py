import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_backend.settings')
django.setup()

try:
    from api import serializers
    print("Successfully imported api.serializers")
    print(dir(serializers))
except Exception as e:
    print(f"Error importing api.serializers: {e}")
    import traceback
    traceback.print_exc()

try:
    from api import views
    print("Successfully imported api.views")
except Exception as e:
    print(f"Error importing api.views: {e}")
    import traceback
    traceback.print_exc()
