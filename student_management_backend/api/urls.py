from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'classes', views.ClassViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'leaves', views.LeaveViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'marks', views.MarkViewSet)
router.register(r'assignments', views.AssignmentViewSet)

urlpatterns = [
    # Auth endpoints
    path('auth/login', views.login_view, name='login'),
    path('auth/register', views.register_view, name='register'),
    
    # Custom dashboard endpoints
    path('classes/teacher_dashboard/', views.class_teacher_dashboard, name='class-teacher-dashboard'),
    path('teachers/subject_dashboard/', views.subject_teacher_dashboard, name='subject-teacher-dashboard'),
    
    # Router URLs
    path('', include(router.urls)),
]