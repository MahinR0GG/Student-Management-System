from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Class, Attendance, Leave, Subject, Event
from .serializers import (
    UserSerializer, LoginSerializer, ClassSerializer,
    AttendanceSerializer, LeaveSerializer, SubjectSerializer, EventSerializer
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
        
        return queryset

# Class ViewSet
class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

# Attendance ViewSet
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    
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

# Leave ViewSet
class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    
    def get_queryset(self):
        queryset = Leave.objects.all()
        student_id = self.request.query_params.get('student')
        status_filter = self.request.query_params.get('status')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')

# Subject ViewSet
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    
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
    
    def get_queryset(self):
        queryset = Event.objects.all()
        audience = self.request.query_params.get('audience')
        class_name = self.request.query_params.get('className')
        
        if audience:
            queryset = queryset.filter(Q(audience='ALL') | Q(audience=audience))
        if class_name:
            queryset = queryset.filter(Q(audience='ALL') | Q(class_name=class_name))
        
        return queryset.order_by('-date')