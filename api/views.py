from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from django.db.models import Q
from datetime import date
from .models import User, Class, Attendance, Leave, Subject, Event, Mark, Assignment
from .serializers import (
    UserSerializer, LoginSerializer, ClassSerializer,
    AttendanceSerializer, LeaveSerializer, SubjectSerializer, EventSerializer,
    MarkSerializer, AssignmentSerializer
)

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'message': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    user_type = serializer.validated_data['userType']
    
    try:
        # Find user by email
        user = User.objects.get(email=email)
        
        # Check password
        if not user.check_password(password):
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if role matches
        if user.role.lower() != user_type.lower():
            return Response({'message': 'Invalid user type'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Return user data
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Login successful',
            'user': user_data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register new user"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        password = request.data.get('password')
        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            password=password,
            name=serializer.validated_data['name'],
            role=serializer.validated_data['role'],
            className=serializer.validated_data.get('className'),
            division=serializer.validated_data.get('division'),
            subject=serializer.validated_data.get('subject')
        )
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User ViewSet
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        class_name = self.request.query_params.get('className')
        division = self.request.query_params.get('division')
        
        if role:
            queryset = queryset.filter(role=role)
        if class_name:
            queryset = queryset.filter(className=class_name)
        if division:
            queryset = queryset.filter(division=division)
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Override list to return data in expected format"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'users': serializer.data
        }, status=status.HTTP_200_OK)
    
    def create(self, request, *args, **kwargs):
        """Override create to handle user creation with password"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            password = request.data.get('password', 'defaultpassword')
            user = User.objects.create_user(
                email=serializer.validated_data['email'],
                password=password,
                name=serializer.validated_data['name'],
                role=serializer.validated_data['role'],
                className=serializer.validated_data.get('className'),
                division=serializer.validated_data.get('division'),
                subject=serializer.validated_data.get('subject')
            )
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return proper response"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'message': 'User deleted successfully'
        }, status=status.HTTP_200_OK)

# Class ViewSet
class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [AllowAny]

# Attendance ViewSet
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Attendance.objects.all()
        student_id = self.request.query_params.get('student')
        date_param = self.request.query_params.get('date')
        class_name = self.request.query_params.get('className')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if date_param:
            queryset = queryset.filter(date=date_param)
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple students"""
        class_id = request.data.get('classId')
        teacher_id = request.data.get('teacherId')
        attendance_date = request.data.get('date')
        records = request.data.get('records', [])
        
        if not all([class_id, teacher_id, attendance_date, records]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_obj = Class.objects.get(id=class_id)
            teacher = User.objects.get(id=teacher_id, role='teacher')
            class_name = f"{class_obj.class_number}"
            division = class_obj.division
            
            created_count = 0
            updated_count = 0
            
            for record in records:
                student_id = record.get('studentId')
                is_present = record.get('present', True)
                
                attendance, created = Attendance.objects.update_or_create(
                    student_id=student_id,
                    date=attendance_date,
                    defaults={
                        'teacher': teacher,
                        'status': 'Present' if is_present else 'Absent',
                        'class_name': class_name,
                        'division': division,
                        'marked_by': teacher.name
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
            
            return Response({
                'message': 'Attendance marked successfully',
                'created': created_count,
                'updated': updated_count
            }, status=status.HTTP_200_OK)
            
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Leave ViewSet
class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Leave.objects.all()
        student_id = self.request.query_params.get('student')
        status_filter = self.request.query_params.get('status')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

# Subject ViewSet
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Subject.objects.all()
        class_name = self.request.query_params.get('className')
        
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        
        return queryset

# Event ViewSet
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        audience = self.request.query_params.get('audience')
        class_name = self.request.query_params.get('className')
        
        if audience:
            queryset = queryset.filter(Q(audience='ALL') | Q(audience=audience))
        if class_name:
            queryset = queryset.filter(Q(audience='ALL') | Q(class_name=class_name))
        
        return queryset.order_by('-date')

# Mark ViewSet
class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Mark.objects.all()
        student_id = self.request.query_params.get('student')
        class_name = self.request.query_params.get('className')
        subject_id = self.request.query_params.get('subject')
        exam_type = self.request.query_params.get('exam_type')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get all marks for a specific class"""
        class_id = request.query_params.get('class_id')
        if not class_id:
            return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_obj = Class.objects.get(id=class_id)
            class_name = f"{class_obj.class_number}"
            division = class_obj.division
            
            marks = Mark.objects.filter(class_name=class_name, division=division)
            serializer = self.get_serializer(marks, many=True)
            return Response({'marks': serializer.data}, status=status.HTTP_200_OK)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)

# Assignment ViewSet
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Assignment.objects.all()
        class_name = self.request.query_params.get('className')
        division = self.request.query_params.get('division')
        teacher_id = self.request.query_params.get('teacher')
        subject_id = self.request.query_params.get('subject')
        
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        if division:
            queryset = queryset.filter(division=division)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        return queryset.order_by('-created_at')

# Custom Dashboard Endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def class_teacher_dashboard(request):
    """Get all data for class teacher dashboard"""
    teacher_id = request.query_params.get('teacher_id')
    
    if not teacher_id:
        return Response({'error': 'teacher_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        teacher = User.objects.get(id=teacher_id, role='teacher')
        
        # Find class where this teacher is class teacher
        try:
            class_obj = Class.objects.get(class_teacher_id=teacher_id)
        except Class.DoesNotExist:
            return Response({'error': 'Teacher is not assigned as a class teacher'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get students in this class
        class_name = str(class_obj.class_number)
        division = class_obj.division
        students = User.objects.filter(role='student', className=class_name, division=division)
        
        # Get today's attendance
        today = date.today()
        today_attendance = Attendance.objects.filter(
            class_name=class_name,
            division=division,
            date=today
        )
        present_today = today_attendance.filter(status='Present').count()
        
        # Get pending leave requests
        student_ids = students.values_list('id', flat=True)
        pending_leaves = Leave.objects.filter(
            student_id__in=student_ids,
            status='Pending'
        )
        
        # Get subjects for this class
        subjects = Subject.objects.filter(class_name=class_name)
        
        # Get events for this class
        events = Event.objects.filter(
            Q(audience='ALL') | Q(class_name=class_name, division=division)
        ).order_by('-date')[:10]
        
        return Response({
            'teacher': UserSerializer(teacher).data,
            'class': ClassSerializer(class_obj).data,
            'students': UserSerializer(students, many=True).data,
            'total_students': students.count(),
            'present_today': present_today,
            'pending_leaves': LeaveSerializer(pending_leaves, many=True).data,
            'subjects': SubjectSerializer(subjects, many=True).data,
            'events': EventSerializer(events, many=True).data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def subject_teacher_dashboard(request):
    """Get all data for subject teacher dashboard"""
    teacher_id = request.query_params.get('teacher_id')
    
    if not teacher_id:
        return Response({'error': 'teacher_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        teacher = User.objects.get(id=teacher_id, role='teacher')
        
        # Get subjects taught by this teacher
        subjects = Subject.objects.filter(class_teacher_id=teacher_id)
        
        # Get all classes
        classes = Class.objects.all()
        
        # Get assignments created by this teacher
        assignments = Assignment.objects.filter(teacher_id=teacher_id)
        
        return Response({
            'teacher': UserSerializer(teacher).data,
            'subjects': SubjectSerializer(subjects, many=True).data,
            'classes': ClassSerializer(classes, many=True).data,
            'assignments': AssignmentSerializer(assignments, many=True).data,
            'total_assignments': assignments.count(),
            'pending_assignments': assignments.filter(status='Pending').count()
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)