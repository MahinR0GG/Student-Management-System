from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Class, Attendance, Leave, Subject, Event, Mark, Assignment

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'className', 'division', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['email', 'name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'role', 'className', 'division', 'subject')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'password1', 'password2'),
        }),
    )

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['class_number', 'division', 'class_teacher_name', 'students_count']
    list_filter = ['class_number', 'division']
    search_fields = ['class_teacher_name']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'status', 'class_name', 'division']
    list_filter = ['status', 'date', 'class_name']
    search_fields = ['student__name', 'marked_by']
    date_hierarchy = 'date'

@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ['student', 'reason', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'start_date']
    search_fields = ['student__name', 'reason']
    date_hierarchy = 'start_date'

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'class_name', 'class_teacher']
    list_filter = ['class_name']
    search_fields = ['name']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'audience', 'class_name', 'division']
    list_filter = ['audience', 'date']
    search_fields = ['title', 'description']
    date_hierarchy = 'date'

@admin.register(Mark)
class MarkAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'exam_type', 'marks_obtained', 'total_marks', 'percentage']
    list_filter = ['exam_type', 'class_name', 'division']
    search_fields = ['student__name', 'subject__name']
    
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'class_name', 'division', 'subject', 'teacher', 'due_date', 'status']
    list_filter = ['status', 'class_name', 'due_date']
    search_fields = ['title', 'description', 'teacher__name']
    date_hierarchy = 'due_date'