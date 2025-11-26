from rest_framework import serializers
from .models import User, Class, Attendance, Leave, Subject, Event, Marks

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'className', 'division', 'subject', 'created_at', 'password']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    userType = serializers.CharField()

class ClassSerializer(serializers.ModelSerializer):
    class_teacher_name = serializers.CharField(source='class_teacher.name', read_only=True, allow_null=True)
    class_teacher_subject = serializers.CharField(source='class_teacher.subject', read_only=True, allow_null=True)
    
    class Meta:
        model = Class
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    # Make student a proper writable FK field
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'))
    id = serializers.IntegerField(read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = Leave
        fields = [
            'id',
            'student',
            'student_name',
            'reason',
            'start_date',
            'end_date',
            'details',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'student_name']
# class LeaveSerializer(serializers.ModelSerializer):
#     student_name = serializers.CharField(source='student.name', read_only=True)
    
#     class Meta:
#         model = Leave
#         fields = '__all__'
#         read_only_fields = ['id', 'student', 'created_at', 'updated_at', 'student_name']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class MarksSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    
    class Meta:
        model = Marks
        fields = [
            'id',
            'student',
            'student_name',
            'teacher',
            'teacher_name',
            'subject',
            'class_name',
            'division',
            'exam_type',
            'marks_obtained',
            'total_marks',
            'percentage',
            'remarks',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'percentage', 'created_at', 'updated_at', 'student_name', 'teacher_name']
