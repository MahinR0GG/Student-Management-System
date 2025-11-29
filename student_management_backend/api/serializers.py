from rest_framework import serializers
from .models import User, Class, Attendance, Leave, Subject, Event, Mark, Assignment

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
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='student')
    )

    class Meta:
        model = Leave
        fields = [
            'id',
            'student',
            'reason',
            'start_date',
            'end_date',
            'details',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class MarkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    # subject is now a CharField, so subject_name is just the subject field itself
    subject_name = serializers.CharField(source='subject', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    
    class Meta:
        model = Mark
        fields = [
            'id',
            'student',
            'student_name',
            'subject',
            'subject_name',
            'exam_type',
            'marks_obtained',
            'total_marks',
            'percentage',
            'remarks',
            'class_name',
            'division',
            'teacher',
            'teacher_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'percentage', 'created_at', 'updated_at']
        # Disable unique_together validation to allow custom create method to handle it
        validators = []

class AssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'due_date',
            'class_name',
            'division',
            'subject',
            'subject_name',
            'teacher',
            'teacher_name',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']