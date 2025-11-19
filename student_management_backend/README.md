# Django Backend Setup Guide

## Prerequisites
- Python 3.8+
- MySQL database
- Virtual environment activated

## Installation Steps

### 1. Activate Virtual Environment
```bash
# From project root
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies
```bash
cd student_management_backend
pip install -r requirements.txt
```

### 3. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE student_management;
```

### 4. Configure Database (if needed)

Edit `student_management_backend/settings.py` or set environment variables:
- `DB_NAME=student_management`
- `DB_USER=root`
- `DB_PASS=your_password`
- `DB_HOST=localhost`

### 5. Run Migrations

```bash
# Create migration files
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The server will run on `http://localhost:8000`

## API Endpoints

All API endpoints are prefixed with `/api/`:

- **Auth**: `/api/auth/login/`
- **Admin**: `/api/admin/`
- **Classes**: `/api/classes/`
- **Attendance**: `/api/attendance/`
- **Leave**: `/api/leave/`
- **Students**: `/api/student/`
- **Teachers**: `/api/teachers/`
- **Subjects**: `/api/subjects/`
- **Events**: `/api/admin/events/`

## Frontend Integration

The Angular frontend is configured to use `http://localhost:8000/api` as the base URL.

## Testing

1. Start Django server: `python manage.py runserver`
2. Start Angular frontend: `cd ../client && npm start`
3. Open browser: `http://localhost:4200`

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check database credentials in settings.py
- Verify database exists

### Migration Errors
- Delete migration files in `api/migrations/` (except `__init__.py`)
- Run `python manage.py makemigrations` again
- Run `python manage.py migrate`

### Port Already in Use
- Change port: `python manage.py runserver 8001`
- Update frontend API URL accordingly

