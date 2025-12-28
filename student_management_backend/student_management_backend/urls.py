from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def welcome(request):
    return JsonResponse({
        'message': 'Student Management System API',
        'version': '1.0',
        'endpoints': {
            'api': '/api/',
            'admin': '/admin/',
            'auth_login': '/api/auth/login',
            'auth_register': '/api/auth/register',
            'users': '/api/users/',
            'classes': '/api/classes/',
            'attendance': '/api/attendance/',
            'leaves': '/api/leaves/',
            'subjects': '/api/subjects/',
            'events': '/api/events/',
        }
    })

urlpatterns = [
    path('', welcome, name='welcome'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
