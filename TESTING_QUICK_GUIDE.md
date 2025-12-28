# Quick Testing & Feature Guide

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd c:\Hari\Student-Management\student_management_backend
python manage.py runserver 8000
```

### 2. Start Frontend Server
```bash
cd c:\Hari\Student-Management\client
npm start
```

### 3. Open Browser
```
http://localhost:4200
```

---

## 👨‍🏫 Login Credentials (Class Teachers)

| Email | Password | Class | Notes |
|-------|----------|-------|-------|
| mahin@gmail.com | (set on creation) | 9B | Has 1 student assigned |
| peter@gmail.com | (set on creation) | 10A | Has students assigned |

---

## ✨ New Features to Test

### Feature 1: Edit Student Details ⭐

**How to Test:**
1. Login as class teacher
2. Select "Class Teacher" role
3. Click "Student Roster" in sidebar
4. Click "Edit" button on any student
5. Change student name or class
6. Click "Save Changes"
7. Verify changes in the student list

**What Changed:**
- ✅ Edit modal dialog appears centered on screen
- ✅ Student fields are editable (Name, Class, Division)
- ✅ Student ID and Email are read-only
- ✅ Changes persist in database
- ✅ Modal closes after successful save

---

### Feature 2: Attendance Counting ⭐

**How to Test:**
1. Go to "Dashboard Overview"
2. Notice new KPI card for "Absent Today"
3. Go to "Take Attendance"
4. Select a date
5. Click "Mark All Present" or "Mark All Absent"
6. Click "Save Attendance"
7. Go back to Overview
8. Verify Present/Absent counts updated

**What Changed:**
- ✅ 4 KPI cards now (added Absent count)
- ✅ Counts update automatically after saving attendance
- ✅ Last attendance date displayed in overview
- ✅ Better visual feedback with colored buttons

---

### Feature 3: View Student Marks ⭐

**How to Test:**
1. Go to "Exam Marks" section
2. See table with columns: Student, Subject, Exam Type, Marks, Percentage
3. Marks shown if subject teachers have entered them
4. Filter by subject or exam type if needed

**What Changed:**
- ✅ New database model created for storing marks
- ✅ Backend API endpoint to fetch marks
- ✅ Frontend displays marks in organized table
- ✅ Auto-calculates percentage (marks/total * 100)
- ✅ Shows remarks from subject teacher

**Note:**
- Marks need to be created by subject teachers first
- Can also create test marks via Django admin or API

---

### Feature 4: Improved UI/Layout ⭐

**What Changed:**
- ✅ Better sidebar navigation with active states
- ✅ Consistent purple color scheme (#8a63d2)
- ✅ Modal dialog for editing with clean form
- ✅ Better button styling (colored buttons)
- ✅ Improved table styling with hover effects
- ✅ Responsive design on all screen sizes
- ✅ Smooth animations and transitions

**Visual Improvements:**
- Sidebar highlights active menu item
- Buttons have different colors for different actions
- Tables have better spacing and borders
- Forms have clear labels and inputs
- All elements use consistent spacing

---

## 🧪 Test Scenarios

### Scenario 1: Complete Workflow
```
1. Login as mahin@gmail.com
2. Select "Class Teacher" role
3. View Dashboard Overview (see all stats)
4. Go to Student Roster
5. Edit one student's name
6. Go to Take Attendance
7. Mark attendance for all students
8. Save and return to Overview (verify counts)
9. Go to Exam Marks (view if any exist)
10. Logout
```

### Scenario 2: Data Persistence
```
1. Edit student details
2. Refresh browser (F5)
3. Go to roster again
4. Verify changes are still there
```

### Scenario 3: Error Handling
```
1. Try to edit with empty name
2. Try to save without selecting attendance
3. Verify error messages appear
```

---

## 📊 Database Marks Testing

### Add Test Marks via API (Using Postman or curl)

**Create Mark:**
```bash
POST http://localhost:8000/api/marks/

Body (JSON):
{
  "student": 3,
  "teacher": 2,
  "subject": "Maths",
  "class_name": "9",
  "division": "B",
  "exam_type": "Final Exam",
  "marks_obtained": 85,
  "total_marks": 100,
  "remarks": "Good performance"
}

Response: 200 OK with percentage auto-calculated to 85.0
```

**Get Marks for Class:**
```bash
GET http://localhost:8000/api/marks/by_class/?class_id=1

Response: Array of all marks for class 1
```

---

## 🔧 Troubleshooting

### Issue: Edit Modal Not Appearing
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors (F12)

### Issue: Attendance Counts Not Updating
**Solution:**
- Verify attendance was saved successfully
- Check if students have attendance records
- Reload page to refresh stats

### Issue: No Marks Showing
**Solution:**
- Marks must be created by subject teacher first
- Check if class_id is correct
- Use "Get Marks for Class" API to verify

### Issue: Save Button Not Working
**Solution:**
- Check if user is logged in properly
- Verify user is assigned as class teacher
- Check browser console for API errors
- Verify backend is running on port 8000

---

## 📝 API Testing with curl

### Get All Marks
```bash
curl http://localhost:8000/api/marks/
```

### Get Marks for Specific Class
```bash
curl "http://localhost:8000/api/marks/by_class/?class_id=1"
```

### Get Marks for Specific Student
```bash
curl "http://localhost:8000/api/marks/?student_id=3"
```

### Create New Mark Entry
```bash
curl -X POST http://localhost:8000/api/marks/ \
  -H "Content-Type: application/json" \
  -d '{
    "student": 3,
    "teacher": 2,
    "subject": "Maths",
    "class_name": "9",
    "division": "B",
    "exam_type": "Final Exam",
    "marks_obtained": 75,
    "total_marks": 100
  }'
```

---

## ✅ Feature Completion Status

| Feature | Status | Location |
|---------|--------|----------|
| Student Editing | ✅ Complete | Student Roster |
| Attendance Counting | ✅ Complete | Overview + Attendance |
| Marks Viewing | ✅ Complete | Exam Marks Tab |
| UI Improvements | ✅ Complete | Entire Dashboard |
| Database Setup | ✅ Complete | Backend |
| API Endpoints | ✅ Complete | /api/marks/* |

---

## 📚 Additional Resources

- **Django Documentation**: https://docs.djangoproject.com
- **Angular Documentation**: https://angular.io/docs
- **REST Framework**: https://www.django-rest-framework.org

---

**Last Updated**: November 26, 2025
**System Status**: ✅ All Features Implemented and Tested
