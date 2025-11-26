# Student Management System

A comprehensive web-based Student Management System built with **Django REST Framework** (Backend) and **Angular 19** (Frontend).

## 🎯 Features

### Admin Dashboard
- User management (Students, Teachers, Admins)
- Class and subject management
- System-wide analytics and reports
- Event management

### Class Teacher Dashboard
- Class overview with real-time statistics
- Attendance management with bulk marking
- Student roster management
- Leave request approval/rejection
- Student performance tracking (marks by subject/exam)
- Academic overview
- Event management for class

### Subject Teacher Dashboard
- **Exam marks entry with class selection**
- Bulk marks assignment for all students
- Assignment creation and management
- Assignments visible to students
- Resource sharing
- Multi-class support

### Student Dashboard
- Personal profile and attendance history
- Leave request submission
- View marks and performance
- Access assignments and resources
- Event calendar

## 🛠️ Technology Stack

**Backend:**
- Django 5.2.8
- Django REST Framework
- MySQL Database
- PyMySQL

**Frontend:**
- Angular 19.2.0
- Angular Material
- Chart.js
- RxJS

## 📋 Prerequisites

- **Python** 3.8 or higher
- **Node.js** 18.x or higher
- **MySQL** 8.0 or higher
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Student-Management-System
```

### 2. Backend Setup (Django)

#### Create Virtual Environment (in root directory)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
cd student_management_backend
pip install -r requirements.txt
```

#### Database Configuration

Create a MySQL database:

```sql
CREATE DATABASE student_management;
```

Update database settings in `student_management_backend/student_management_backend/settings.py` (if needed):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'student_management',
        'USER': 'root',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

#### Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

#### Start Backend Server

```bash
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### 3. Frontend Setup (Angular)

#### Install Dependencies

```bash
# Open a new terminal
cd client
npm install
```

#### Start Frontend Server

```bash
npm start
# or
ng serve
```

Frontend will run on: `http://localhost:4200`

## 🎮 Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
# From project root
venv\Scripts\activate  # Windows
cd student_management_backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
# From project root
cd client
npm start
```

Access the application at: `http://localhost:4200`

## 📡 API Endpoints

Base URL: `http://localhost:8000/api`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/` - Get all users
- `GET /api/users/?role=student` - Get users by role
- `GET /api/users/?className=8&division=A` - Get users by class

### Classes
- `GET /api/classes/` - Get all classes
- `GET /api/classes/teacher_dashboard/?teacher_id={id}` - Class teacher dashboard data

### Attendance
- `GET /api/attendance/` - Get attendance records
- `POST /api/attendance/` - Mark attendance
- `POST /api/attendance/bulk_mark/` - Bulk mark attendance

### Leaves
- `GET /api/leaves/` - Get leave requests
- `POST /api/leaves/` - Create leave request
- `PATCH /api/leaves/{id}/` - Update leave status

### Subjects
- `GET /api/subjects/` - Get all subjects
- `GET /api/subjects/?className={class}` - Get subjects by class

### Events
- `GET /api/events/` - Get all events
- `POST /api/events/` - Create event

### Marks (New)
- `GET /api/marks/` - Get all marks
- `GET /api/marks/?student={id}` - Get marks by student
- `GET /api/marks/by_class/?class_id={id}` - Get marks by class
- `POST /api/marks/` - Create marks entry

### Assignments (New)
- `GET /api/assignments/` - Get all assignments
- `GET /api/assignments/?teacher={id}` - Get assignments by teacher
- `GET /api/assignments/?className={class}&division={div}` - Get assignments by class
- `POST /api/assignments/` - Create assignment
- `DELETE /api/assignments/{id}/` - Delete assignment

### Teacher Dashboards
- `GET /api/classes/teacher_dashboard/?teacher_id={id}` - Class teacher dashboard
- `GET /api/teachers/subject_dashboard/?teacher_id={id}` - Subject teacher dashboard

## 📁 Project Structure

```
Student-Management-System/
├── client/                          # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin-dashboard/
│   │   │   ├── class-teacher-dashboard/
│   │   │   ├── subject-teacher-dashboard/
│   │   │   ├── student-dashboard/
│   │   │   ├── services/
│   │   │   │   └── api.service.ts
│   │   │   └── login/
│   │   └── index.html
│   ├── package.json
│   └── angular.json
│
├── student_management_backend/      # Django Backend
│   ├── api/
│   │   ├── models.py               # Database models
│   │   ├── serializers.py          # DRF serializers
│   │   ├── views.py                # API views
│   │   ├── urls.py                 # API routes
│   │   ├── admin.py                # Admin configuration
│   │   └── migrations/
│   ├── student_management_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

## 🔐 Default Users

After running migrations, you can create test users or use the registration endpoint.

**Example Login:**
- Email: `teacher@example.com`
- Password: `your_password`
- Role: `teacher`

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check database credentials in `settings.py`
- Verify database `student_management` exists

### Port Already in Use
**Backend:**
```bash
python manage.py runserver 8001
```
Update frontend API URL in `client/src/app/services/api.service.ts`

**Frontend:**
```bash
ng serve --port 4201
```

### Migration Errors
```bash
# Delete all migration files except __init__.py
python manage.py makemigrations
python manage.py migrate
```

### CORS Errors
Ensure `corsheaders` is installed and configured in `settings.py`:
```python
INSTALLED_APPS = [
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',
]
```

## 📝 Recent Updates

### Teacher Dashboard Fixes (Latest)
✅ **Backend:**
- Added `Mark` model for student exam marks
- Added `Assignment` model for teacher assignments
- Implemented bulk attendance marking endpoint
- Created dedicated teacher dashboard endpoints

✅ **Class Teacher Dashboard:**
- Fixed attendance reflection (absentToday calculation)
- Implemented student performance view with filtering
- Added marks data processing

✅ **Subject Teacher Dashboard:**
- Implemented class selection for marks entry
- Bulk marks saving for all students in a class
- Assignment creation with class selection
- Assignments now visible to students

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Django REST Framework documentation
- Angular documentation
- Material Design
