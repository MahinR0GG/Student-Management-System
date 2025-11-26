# Troubleshooting Guide

## ✅ Step-by-Step Setup Checklist

### 1. Activate Virtual Environment
```bash
# Navigate to project root
cd "D:\ZIP\student-management-system (2)\Student-Management-System"

# Activate venv (Windows PowerShell)
venv\Scripts\Activate.ps1

# OR (Windows CMD)
venv\Scripts\activate.bat
```

**Verify:** You should see `(venv)` in your terminal prompt

### 2. Install Dependencies
```bash
cd student_management_backend
pip install -r requirements.txt
```

**If mysqlclient fails:**
```bash
pip install pymysql
```
Then add to `settings.py` (at the top, after imports):
```python
import pymysql
pymysql.install_as_MySQLdb()
```

### 3. Create Database
```sql
-- In MySQL
CREATE DATABASE student_management;
```

### 4. Run Migrations
```bash
# Create migration files
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 5. Test Django
```bash
python manage.py check
```

**Expected output:** `System check identified no issues (0 silenced).`

### 6. Start Server
```bash
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### 7. Test API
Open browser: `http://127.0.0.1:8000/api/`

You should see the Django REST Framework API root page.

## 🔧 Common Errors & Solutions

### Error 1: "ModuleNotFoundError: No module named 'django'"
**Cause:** Virtual environment not activated

**Solution:**
```bash
# Make sure you're in project root
cd "D:\ZIP\student-management-system (2)\Student-Management-System"

# Activate venv
venv\Scripts\Activate.ps1

# Verify Django is installed
pip list | findstr django
```

### Error 2: "ImproperlyConfigured: Cannot use @action decorator on list"
**Status:** ✅ FIXED - Removed @action decorators from list methods

### Error 3: "django.db.utils.OperationalError: (2003, 'Can't connect to MySQL server')"
**Cause:** MySQL not running or wrong credentials

**Solution:**
1. Start MySQL service
2. Check credentials in `settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'student_management',  # Database name
           'USER': 'root',                 # Your MySQL username
           'PASSWORD': '',                 # Your MySQL password
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

### Error 4: "django.db.utils.ProgrammingError: (1146, 'Table doesn't exist')"
**Cause:** Migrations not applied

**Solution:**
```bash
python manage.py makemigrations
python manage.py migrate
```

### Error 5: "Port 8000 already in use"
**Solution:**
```bash
# Use different port
python manage.py runserver 8001
```

Then update `client/src/app/services/api.service.ts`:
```typescript
private baseUrl = 'http://localhost:8001/api';
```

### Error 6: CORS errors in browser console
**Cause:** CORS headers not configured

**Solution:**
1. Verify `django-cors-headers` is installed:
   ```bash
   pip list | findstr cors
   ```

2. Check `settings.py` has:
   ```python
   INSTALLED_APPS = [
       ...
       'corsheaders',
   ]
   
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',  # Must be first
       ...
   ]
   
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:4200",
   ]
   ```

## 🧪 Testing Endpoints

### Test Login Endpoint
```bash
# Using curl (if available)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test\",\"userType\":\"admin\"}"
```

### Test in Browser
1. Go to: `http://localhost:8000/api/`
2. You should see API root with all endpoints listed

### Test with Postman/Thunder Client
- URL: `http://localhost:8000/api/auth/login/`
- Method: POST
- Body (JSON):
  ```json
  {
    "email": "test@test.com",
    "password": "test",
    "userType": "admin"
  }
  ```

## 📋 Verification Checklist

- [ ] Virtual environment activated (see `(venv)` in prompt)
- [ ] Django installed (`pip list | findstr django`)
- [ ] MySQL running and database created
- [ ] Migrations applied (`python manage.py migrate`)
- [ ] No errors in `python manage.py check`
- [ ] Server starts without errors
- [ ] API root accessible at `http://localhost:8000/api/`
- [ ] Frontend API URL updated to `http://localhost:8000/api`

## 🚀 Quick Start Commands

```bash
# Terminal 1: Django Backend
cd "D:\ZIP\student-management-system (2)\Student-Management-System"
venv\Scripts\Activate.ps1
cd student_management_backend
python manage.py runserver

# Terminal 2: Angular Frontend
cd "D:\ZIP\student-management-system (2)\Student-Management-System\client"
npm start
```

## 📞 Still Having Issues?

1. **Check Django version:**
   ```bash
   python -m django --version
   ```
   Should be 5.0 or higher

2. **Check Python version:**
   ```bash
   python --version
   ```
   Should be 3.8 or higher

3. **Verify virtual environment:**
   ```bash
   python -c "import sys; print(sys.prefix)"
   ```
   Should show path to `venv` folder

4. **Check installed packages:**
   ```bash
   pip list
   ```
   Should show: django, djangorestframework, django-cors-headers, mysqlclient (or pymysql)

5. **Check for syntax errors:**
   ```bash
   python manage.py check
   ```

