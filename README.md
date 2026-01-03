# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

A comprehensive HRMS solution built with the MERN stack to digitize and streamline core HR operations including employee onboarding, profile management, attendance tracking, leave management, and payroll visibility.

## 🚀 Features

### For Employees
- ✅ Secure authentication (Sign Up / Sign In)
- 👤 Personal profile management
- ⏰ Daily attendance tracking (Check-in/Check-out)
- 📅 Leave application and management
- 💰 Payroll and salary slip viewing
- 📊 Dashboard with quick access to all features

### For Admin/HR
- 👥 Employee management (CRUD operations)
- ✔️ Attendance approval and tracking
- 📋 Leave request approval workflow
- 💵 Payroll management and salary structure updates
- 📈 Analytics and reports

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📁 Project Structure

```
Dayflow---Human-Resource-Management-System/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── models/            # Mongoose models
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
│
└── client/                # Frontend
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── context/      # React context
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── App.jsx       # Main app component
    │   ├── main.jsx      # Entry point
    │   └── index.css     # Global styles
    └── index.html        # HTML template
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dayflow---Human-Resource-Management-System
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://college:darshil123@college.eej7x.mongodb.net/dayflow-hrms?retryWrites=true&w=majority&appName=college
   JWT_SECRET=dayflow_hrms_secret_key_2026_secure_token_generation
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on `http://localhost:5173`

3. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees/profile` - Get own profile
- `PUT /api/employees/profile` - Update own profile
- `GET /api/employees` - Get all employees (Admin)
- `GET /api/employees/:id` - Get employee by ID (Admin)
- `PUT /api/employees/:id` - Update employee (Admin)
- `DELETE /api/employees/:id` - Delete employee (Admin)

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my` - Get own attendance
- `GET /api/attendance/all` - Get all attendance (Admin)
- `POST /api/attendance/mark` - Mark attendance (Admin)
- `PUT /api/attendance/:id` - Update attendance (Admin)

### Leave
- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my` - Get own leaves
- `GET /api/leaves/balance` - Get leave balance
- `GET /api/leaves/all` - Get all leaves (Admin)
- `PUT /api/leaves/:id/approve` - Approve leave (Admin)
- `PUT /api/leaves/:id/reject` - Reject leave (Admin)
- `DELETE /api/leaves/:id` - Cancel leave

## 👤 User Roles

### Employee
- View and edit limited profile fields
- Track attendance
- Apply for leave
- View payroll information

### Admin/HR
- Full access to all employee data
- Approve/reject leave requests
- Manage attendance records
- Update salary structures
- Generate reports

## 🎨 UI Design

The application features a modern, professional design with:
- Gradient color schemes (Purple & Pink)
- Glassmorphism effects
- Smooth animations and transitions
- Responsive layouts for all devices
- Intuitive navigation

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Secure environment variables

## 📦 Database Models

- **User** - Authentication and role management
- **Employee** - Personal and job details
- **Attendance** - Daily attendance records
- **Leave** - Leave requests and approvals

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Developed as part of the 23IT049 project

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vite for fast development experience
- React Icons for beautiful icons
