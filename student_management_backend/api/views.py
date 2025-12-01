from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Class, Attendance, Leave, Subject, Event, Marks
from .serializers import (
    UserSerializer, LoginSerializer, ClassSerializer,
    AttendanceSerializer, LeaveSerializer, SubjectSerializer, EventSerializer, MarksSerializer
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
            subject=serializer.validated_data.get('subject'),
            phone=serializer.validated_data.get('phone')
        )
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard_stats(request):
    """Get stats for admin dashboard"""
    try:
        student_count = User.objects.filter(role='student').count()
        teacher_count = User.objects.filter(role='teacher').count()
        class_count = Class.objects.count()
        
        # Calculate attendance percentage for today
        from datetime import date
        today = date.today()
        total_attendance = Attendance.objects.filter(date=today).count()
        present_count = Attendance.objects.filter(date=today, status='Present').count()
        
        attendance_percentage = 0
        if total_attendance > 0:
            attendance_percentage = (present_count / total_attendance) * 100
            
        # Recent activity
        recent_leaves = Leave.objects.all().order_by('-created_at')[:3]
        recent_events = Event.objects.all().order_by('-created_at')[:2]
        
        activity = []
        for leave in recent_leaves:
            activity.append({
                'text': f"Leave request from {leave.student.name}",
                'time': leave.created_at.strftime("%d %b, %H:%M")
            })
            
        for event in recent_events:
            activity.append({
                'text': f"New event: {event.title}",
                'time': event.created_at.strftime("%d %b, %H:%M")
            })
            
        return Response({
            'stats': {
                'students': student_count,
                'teachers': teacher_count,
                'classes': class_count,
                'attendanceToday': f"{int(attendance_percentage)}%"
            },
            'recentActivity': activity
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                subject=serializer.validated_data.get('subject'),
                phone=serializer.validated_data.get('phone')
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

    @action(detail=False, methods=['get'])
    def by_class_teacher(self, request):
        """Get the class for which this teacher is the class teacher"""
        teacher_id = request.query_params.get('teacher_id')
        
        if not teacher_id:
            return Response({'detail': 'teacher_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_obj = Class.objects.get(class_teacher_id=teacher_id)
            serializer = self.get_serializer(class_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Class.DoesNotExist:
            return Response({'detail': 'No class found for this teacher'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def teacher_dashboard(self, request):
        """Get complete dashboard data for class teacher"""
        teacher_id = request.query_params.get('teacher_id')
        
        if not teacher_id:
            return Response({'detail': 'teacher_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the class for this teacher
            class_obj = Class.objects.get(class_teacher_id=teacher_id)
            teacher = User.objects.get(id=teacher_id)
            
            # Get all students in this class
            students = User.objects.filter(
                className=class_obj.class_number,
                division=class_obj.division,
                role='student'
            )
            
            # Get today's attendance
            from datetime import date
            today = date.today()
            attendance_today = Attendance.objects.filter(
                date=today,
                class_name=f"{class_obj.class_number}{class_obj.division}"
            )
            
            # Get pending leave requests for this class
            pending_leaves = Leave.objects.filter(
                status='Pending',
                student__className=class_obj.class_number,
                student__division=class_obj.division
            )
            
            # Get events for this class
            events = Event.objects.filter(
                class_name=str(class_obj.class_number)
            ).order_by('-date')
            
            # Get subjects for this class
            subjects = Subject.objects.filter(
                class_name=f"{class_obj.class_number}{class_obj.division}"
            )
            
            response_data = {
                'class': ClassSerializer(class_obj).data,
                'teacher': UserSerializer(teacher).data,
                'students': UserSerializer(students, many=True).data,
                'attendance_today': AttendanceSerializer(attendance_today, many=True).data,
                'pending_leaves': LeaveSerializer(pending_leaves, many=True).data,
                'events': EventSerializer(events, many=True).data,
                'subjects': SubjectSerializer(subjects, many=True).data,
                'total_students': students.count(),
                'present_today': attendance_today.filter(status='Present').count(),
                'absent_today': attendance_today.filter(status='Absent').count(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        except Class.DoesNotExist:
            return Response({'detail': 'No class found for this teacher'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'detail': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def subject_teacher_dashboard(self, request):
        """Get dashboard data for subject teacher"""
        teacher_id = request.query_params.get('teacher_id')
        class_id = request.query_params.get('class_id')
        
        if not teacher_id:
            return Response({'detail': 'teacher_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            teacher = User.objects.get(id=teacher_id)
            
            # Find all subjects taught by this teacher
            taught_subjects = Subject.objects.filter(class_teacher_id=teacher_id)
            
            if not taught_subjects.exists():
                return Response({
                    'teacher': UserSerializer(teacher).data,
                    'classes': [],
                    'students': [],
                    'marks': [],
                    'message': 'No subjects assigned to this teacher'
                }, status=status.HTTP_200_OK)

            # Get unique classes from subjects
            class_names = taught_subjects.values_list('class_name', flat=True).distinct()
            classes_data = []
            
            for c_name in class_names:
                # Parse "9A" -> 9, "A"
                import re
                match = re.match(r"(\d+)([A-Z]+)", c_name)
                if match:
                    c_num = int(match.group(1))
                    c_div = match.group(2)
                    try:
                        cls = Class.objects.get(class_number=c_num, division=c_div)
                        classes_data.append({
                            'id': cls.id,
                            'name': c_name,
                            'class_number': cls.class_number,
                            'division': cls.division,
                            'subject': taught_subjects.filter(class_name=c_name).first().name
                        })
                    except Class.DoesNotExist:
                        continue

            # If class_id provided, filter for that class, else use first class
            selected_class = None
            if class_id:
                selected_class = next((c for c in classes_data if str(c['id']) == str(class_id)), None)
            
            if not selected_class and classes_data:
                selected_class = classes_data[0]
            
            students_data = []
            marks_data = []
            
            if selected_class:
                # Get students for selected class
                students = User.objects.filter(
                    className=selected_class['class_number'],
                    division=selected_class['division'],
                    role='student'
                )
                students_data = UserSerializer(students, many=True).data
                
                # Get marks for these students for the teacher's subject
                marks = Marks.objects.filter(
                    class_name=selected_class['class_number'],
                    division=selected_class['division'],
                    subject=selected_class['subject']
                )
                marks_data = MarksSerializer(marks, many=True).data

            return Response({
                'teacher': UserSerializer(teacher).data,
                'classes': classes_data,
                'current_class': selected_class,
                'students': students_data,
                'marks': marks_data,
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({'detail': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Attendance ViewSet
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Attendance.objects.all()
        student_id = self.request.query_params.get('student')
        date = self.request.query_params.get('date')
        class_name = self.request.query_params.get('className')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if date:
            queryset = queryset.filter(date=date)
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple students"""
        try:
            class_id = request.data.get('classId')
            date = request.data.get('date')
            records = request.data.get('records', [])
            teacher_id = request.data.get('teacherId')
            
            if not all([class_id, date, records, teacher_id]):
                return Response(
                    {'detail': 'classId, date, records, and teacherId are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the class to get class details
            class_obj = Class.objects.get(id=class_id)
            teacher = User.objects.get(id=teacher_id)
            class_name = f"{class_obj.class_number}{class_obj.division}"
            
            created_count = 0
            
            # Create or update attendance records
            for record in records:
                student_id = record.get('studentId')
                present = record.get('present', False)
                
                if not student_id:
                    continue
                
                student = User.objects.get(id=student_id)
                status_value = 'Present' if present else 'Absent'
                
                # Delete existing record for this date and student
                Attendance.objects.filter(student_id=student_id, date=date).delete()
                
                # Create new record
                attendance = Attendance.objects.create(
                    student=student,
                    teacher=teacher,
                    date=date,
                    status=status_value,
                    class_name=str(class_obj.class_number),
                    division=class_obj.division,
                    marked_by=teacher.name
                )
                created_count += 1
            
            return Response({
                'message': f'Attendance marked successfully for {created_count} students',
                'count': created_count
            }, status=status.HTTP_200_OK)
            
        except Class.DoesNotExist:
            return Response({'detail': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class LeaveViewSet(viewsets.ModelViewSet):
#     queryset = Leave.objects.all()
#     serializer_class = LeaveSerializer
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):
#         queryset = Leave.objects.all()
#         student_id = self.request.query_params.get('student')
#         status_filter = self.request.query_params.get('status')
        
#         if student_id:
#             queryset = queryset.filter(student_id=student_id)
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
        
#         return queryset.order_by('-created_at')
    
#     def create(self, request, *args, **kwargs):
#         # 🔍 Debug: see exactly what frontend sends
#         print("LEAVE CREATE RAW DATA:", request.data)

#         data = request.data.copy()

#         # ✅ Try to normalize different key names from frontend
#         if 'student' not in data or not data.get('student'):
#             # Support studentId / student_id / studentID just in case
#             for key in ('studentId', 'student_id', 'studentID'):
#                 if key in data and data.get(key):
#                     data['student'] = data[key]
#                     break

#         # If still missing -> clean 400 instead of DB crash
#         if 'student' not in data or not data.get('student'):
#             return Response(
#                 {"detail": "Field 'student' (student id) is required."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         serializer = self.get_serializer(data=data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
    
#     # ✅ Allow partial updates via PATCH
#     def partial_update(self, request, *args, **kwargs):
#         print(request.data)
#         kwargs['partial'] = True
#         return super().update(request, *args, **kwargs)


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
    
    def create(self, request, *args, **kwargs):
        print("LEAVE CREATE RAW DATA:", request.data)

        serializer = self.get_serializer(data=request.data)
        print(serializer.initial_data)
        serializer.is_valid(raise_exception=True)

        # 🔍 See what DRF actually passes to the model
        print("LEAVE VALIDATED DATA:", serializer.validated_data)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

# Leave ViewSet
# class LeaveViewSet(viewsets.ModelViewSet):
#     queryset = Leave.objects.all()
#     serializer_class = LeaveSerializer
#     permission_classes = [AllowAny]
    
#     def get_queryset(self):
#         queryset = Leave.objects.all()
#         student_id = self.request.query_params.get('student')
#         status_filter = self.request.query_params.get('status')
        
#         if student_id:
#             queryset = queryset.filter(student_id=student_id)
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
        
#         return queryset.order_by('-created_at')
#     def create(self, request, *args, **kwargs):
#         data = request.data.copy()

#         # 🔴 If frontend sends "studentId", map it to "student"
#         if 'student' not in data and 'studentId' in data:
#             data['student'] = data['studentId']

#         serializer = self.get_serializer(data=data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
    
#     # ✅ Allow partial updates via PATCH
#     def partial_update(self, request, *args, **kwargs):
#         print(request.data)
#         kwargs['partial'] = True
#         return super().update(request, *args, **kwargs)

# Subject ViewSet
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Subject.objects.all()
        class_name = self.request.query_params.get('className')
        class_id = self.request.query_params.get('class_id')
        
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        
        # Filter by class_id - need to construct class_name from Class model
        if class_id:
            try:
                class_obj = Class.objects.get(id=class_id)
                constructed_class_name = f"{class_obj.class_number}{class_obj.division}"
                queryset = queryset.filter(class_name=constructed_class_name)
            except Class.DoesNotExist:
                queryset = queryset.none()
        
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

# Marks ViewSet
class MarksViewSet(viewsets.ModelViewSet):
    queryset = Marks.objects.all()
    serializer_class = MarksSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Marks.objects.all()
        student_id = self.request.query_params.get('student_id')
        class_name = self.request.query_params.get('class_name')
        subject = self.request.query_params.get('subject')
        exam_type = self.request.query_params.get('exam_type')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if class_name:
            queryset = queryset.filter(class_name=class_name)
        if subject:
            queryset = queryset.filter(subject=subject)
        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """Get all marks for students in a specific class"""
        class_id = request.query_params.get('class_id')
        
        if not class_id:
            return Response({'detail': 'class_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_obj = Class.objects.get(id=class_id)
            marks = Marks.objects.filter(
                class_name=class_obj.class_number,
                division=class_obj.division
            ).order_by('student__name', 'subject', 'exam_type')
            
            serializer = self.get_serializer(marks, many=True)
            return Response({
                'marks': serializer.data,
                'total_records': marks.count()
            }, status=status.HTTP_200_OK)
        except Class.DoesNotExist:
            return Response({'detail': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
