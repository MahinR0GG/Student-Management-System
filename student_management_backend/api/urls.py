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
router.register(r'marks', views.MarksViewSet)

urlpatterns = [
    # Auth endpoints
    path('auth/login', views.login_view, name='login'),
    path('auth/register', views.register_view, name='register'),
    path('admin/stats', views.admin_dashboard_stats, name='admin-stats'),
    
    # Router URLs
    path('', include(router.urls)),
]