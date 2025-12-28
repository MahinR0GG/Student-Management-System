# Complete Django Setup Steps

## ⚠️ IMPORTANT: Follow these steps in order

### Step 1: Activate Virtual Environment

**Windows (Command Prompt):**
```bash
cd "D:\ZIP\student-management-system (2)\Student-Management-System"
venv\Scripts\activate
```

**Windows (PowerShell):**
```powershell
cd "D:\ZIP\student-management-system (2)\Student-Management-System"
venv\Scripts\Activate.ps1
```

If you get an execution policy error in PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**You should see `(venv)` in your terminal prompt after activation.**

### Step 2: Install Dependencies

```bash
cd student_management_backend
pip install -r requirements.txt
```

If `mysqlclient` fails, install `pymysql` instead:
```bash
pip install pymysql
```

Then edit `student_management_backend/student_management_backend/settings.py` and add at the top (after imports):
```python
import pymysql
pymysql.install_as_MySQLdb()
```

### Step 3: Create Database

Open MySQL and run:
```sql
CREATE DATABASE student_management;
```

### Step 4: Configure Database (if needed)

Edit `student_management_backend/student_management_backend/settings.py` or set environment variables:
- `DB_NAME=student_management`
- `DB_USER=root`
- `DB_PASS=your_mysql_password`
- `DB_HOST=localhost`

### Step 5: Create Migrations

```bash
cd student_management_backend
python manage.py makemigrations
```

### Step 6: Apply Migrations

```bash
python manage.py migrate
```

### Step 7: Test Django Setup

```bash
python manage.py check
```

**If you see "System check identified no issues", you're good to go!**

### Step 8: Start Django Server

```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 9: Test API Endpoint

Open browser and go to: `http://127.0.0.1:8000/api/`

You should see the DRF API root page.

### Step 10: Start Angular Frontend (in a NEW terminal)

**Terminal 2:**
```bash
cd "D:\ZIP\student-management-system (2)\Student-Management-System\client"
npm start
```

## Common Issues & Solutions

### Issue 1: "ModuleNotFoundError: No module named 'django'"
**Solution:** Activate virtual environment first (Step 1)

### Issue 2: "Can't connect to MySQL server"
**Solution:** 
- Make sure MySQL is running
- Check database credentials in settings.py
- Verify database `student_management` exists

### Issue 3: "No migrations to apply"
**Solution:** Run `python manage.py makemigrations` first

### Issue 4: Port 8000 already in use
**Solution:** 
```bash
python manage.py runserver 8001
```
Then update `client/src/app/services/api.service.ts` to use port 8001

### Issue 5: CORS errors in browser
**Solution:** Make sure `django-cors-headers` is installed and `CorsMiddleware` is first in MIDDLEWARE

## Quick Test Commands

```bash
# Check Django installation
python -m django --version

# Check if virtual environment is active (should show venv path)
python -c "import sys; print(sys.prefix)"

# List installed packages
pip list
```

## Project Structure

```
student_management_backend/
├── manage.py                    # Django management script
├── api/                        # API app
│   ├── models.py              # Database models
│   ├── views.py               # API endpoints
│   ├── serializers.py         # Data serialization
│   ├── urls.py                # URL routing
│   └── admin.py               # Admin interface
└── student_management_backend/
    ├── settings.py            # Django settings
    └── urls.py                # Main URL config
```

