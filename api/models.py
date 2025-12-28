from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator

# User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('name', 'Admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

# User Model
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # For students
    className = models.CharField(max_length=10, null=True, blank=True)
    division = models.CharField(max_length=1, null=True, blank=True)
    
    # For teachers
    subject = models.CharField(max_length=100, null=True, blank=True)
    
    # Required for Django admin
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.name} ({self.role})"

# Rest of your models remain the same...
# (Keep Class, Attendance, Leave, Subject, Event models as they are)

# Class Model
class Class(models.Model):
    DIVISION_CHOICES = [('A', 'A'), ('B', 'B'), ('C', 'C')]
    
    class_number = models.IntegerField(
        validators=[MinValueValidator(8), MaxValueValidator(10)]
    )
    division = models.CharField(max_length=1, choices=DIVISION_CHOICES)
    
    class_teacher = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_class',
        limit_choices_to={'role': 'teacher'},
        db_column='teacherId'  # Match Node.js database column name
    )
    class_teacher_name = models.CharField(max_length=255, null=True, blank=True)
    
    subject_teachers = models.JSONField(default=dict, blank=True)
    students_count = models.IntegerField(default=0)
    subjects = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'classes'
        unique_together = [['class_number', 'division']]
    
    def __str__(self):
        return f"{self.class_number}{self.division}"

# Attendance Model
class Attendance(models.Model):
    STATUS_CHOICES = [('Present', 'Present'), ('Absent', 'Absent')]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        limit_choices_to={'role': 'student'}
    )
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='marked_attendance',
        limit_choices_to={'role': 'teacher'}
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    class_name = models.CharField(max_length=10)
    division = models.CharField(max_length=1, null=True, blank=True)
    marked_by = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'attendances'
        unique_together = [['student', 'date']]
    
    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"

# Leave Model
class Leave(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leave_requests',
        limit_choices_to={'role': 'student'}
    )
    reason = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    details = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leaves'
    
    def __str__(self):
        return f"{self.student.name} - {self.reason} - {self.status}"

# Subject Model
class Subject(models.Model):
    name = models.CharField(max_length=100)
    class_name = models.CharField(max_length=10, null=True, blank=True)
    class_teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='taught_subjects',
        limit_choices_to={'role': 'teacher'}
    )
    
    class Meta:
        db_table = 'subjects'
    
    def __str__(self):
        if self.class_name:
            return f"{self.name} - {self.class_name}"
        return self.name

# Event Model
class Event(models.Model):
    AUDIENCE_CHOICES = [('ALL', 'All'), ('CLASS', 'Class')]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    audience = models.CharField(max_length=10, choices=AUDIENCE_CHOICES, default='ALL')
    class_name = models.CharField(max_length=10, null=True, blank=True)
    division = models.CharField(max_length=1, null=True, blank=True)
    created_by = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
    
    def __str__(self):
        return f"{self.title} - {self.date}"

