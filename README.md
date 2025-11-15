# Student-management-system

This project is a Student Management System designed to facilitate the management of students, teachers, and administrators. It is built using Angular for the client-side and Node.js for the server-side.

## Features

### Admin
- Manage users (add, update, delete)
- Oversee the system and monitor activities
- Access reports and analytics

### Teacher
- Manage attendance
- Assign and grade assignments
- Track student performance

### Student
- View personal details and attendance
- Request leave
- Access course materials and assignments

## Project Structure

```
student-management-system
├── client
│   ├── src
│   │   ├── app
│   │   │   ├── components
│   │   │   │   ├── admin
│   │   │   │   ├── teacher
│   │   │   │   ├── student
│   │   │   │   └── shared
│   │   │   ├── services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── data.service.ts
│   │   │   ├── models
│   │   │   │   ├── user.model.ts
│   │   │   │   └── course.model.ts
│   │   │   └── app.component.ts
│   │   ├── assets
│   │   └── environments
│   ├── angular.json
│   └── package.json
├── server
│   ├── src
│   │   ├── controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── course.controller.ts
│   │   ├── models
│   │   │   ├── user.model.ts
│   │   │   └── course.model.ts
│   │   ├── routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── course.routes.ts
│   │   ├── middleware
│   │   │   └── auth.middleware.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

1. Clone the repository.
2. Navigate to the `client` directory and run `npm install` to install client dependencies.
3. Navigate to the `server` directory and run `npm install` to install server dependencies.
4. Configure environment variables for the server.
5. Start the server using `npm start` in the `server` directory.
6. Start the client using `ng serve` in the `client` directory.

## Additional Recommendations
- Implement role-based access control for enhanced security.
- Add unit and integration tests for critical functionalities.
- Consider implementing a notification system for users.