# 🔒 IoT Security Lock System

A real-time IoT security lock system that tracks access attempts and displays them on a live dashboard using Firebase. Perfect for monitoring door access, employee entry logs, and security events in real-time.

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🔥 **Real-time Firebase Integration** - Live updates without page refresh
- 🔒 **Security Access Logging** - Track successful and failed access attempts
- 📊 **Live Dashboard** - Real-time monitoring of access logs
- 🧪 **Test Panel** - Add sample data for development and testing
- 🔐 **Authentication System** - Secure admin access
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Instant Updates** - See changes across all connected devices immediately

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Firebase account
- Git

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/iot-security-lock-system.git
cd iot-security-lock-system
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. Follow our detailed [Firebase Setup Guide](FIREBASE_SETUP_GUIDE.md)

### 4. Configure Environment Variables

```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your Firebase credentials

# Frontend configuration
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Firebase config
```

### 5. Start the Application

```bash
# Start backend server (Terminal 1)
cd backend
npm start

# Start frontend server (Terminal 2)
cd frontend
npm run dev
```

### 6. Access Dashboard

- Open `http://localhost:5173` in your browser
- Login with: `admin` / `admin123`
- Start monitoring access logs in real-time!

## 📖 Documentation

- 📋 [Firebase Setup Guide](FIREBASE_SETUP_GUIDE.md) - Complete Firebase configuration
- 🧪 [Testing Guide](TESTING_GUIDE.md) - How to test all features
- 🚀 [GitHub Deployment Guide](GITHUB_DEPLOYMENT_GUIDE.md) - Deploy to GitHub

## 🏗️ Project Structure

```
├── backend/                 # Node.js Express server
│   ├── firebase-config.js   # Firebase Admin SDK configuration
│   ├── index.js            # Main server file with APIs
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React dashboard application
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Dashboard.jsx    # Main dashboard with real-time data
│   │   │   ├── LoginPage.jsx    # Authentication component
│   │   │   └── TestPanel.jsx    # Development testing panel
│   │   ├── hooks/
│   │   │   └── useFirebaseRealtime.js  # Firebase real-time hook
│   │   ├── Contexts/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   └── firebase-config.js   # Firebase client configuration
│   ├── package.json        # Frontend dependencies
│   └── .env.example        # Frontend environment variables
├── .gitignore              # Git ignore rules
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication

- `POST /api/login` - Admin login

### Access Logs

- `GET /api/logs` - Fetch all access logs
- `POST /api/logs` - Add new access log (for IoT devices)

### Testing

- `POST /api/test-log` - Add random test data

## 🤖 IoT Device Integration

Your IoT security lock can send access data using simple HTTP requests:

```javascript
// Example: Log successful access
fetch("http://your-server:5000/api/logs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    emp_name: "John Doe",
    card_id: "CARD001",
    attempt: "success",
  }),
});
```

The data will appear instantly on all connected dashboards!

## 🎯 Use Cases

- **Office Buildings** - Monitor employee access
- **Residential Security** - Track home entry/exit
- **Warehouse Management** - Log facility access
- **School Security** - Monitor campus entry points
- **Hospital Access Control** - Track restricted area access

## 🛠️ Development

### Adding New Features

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly using our [Testing Guide](TESTING_GUIDE.md)
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Running Tests

```bash
# Test backend APIs
cd backend
npm test

# Test frontend build
cd frontend
npm run build
```

## 🔒 Security

- Environment variables are never committed to the repository
- Firebase security rules should be configured for production
- All API endpoints include proper error handling
- Authentication is required for dashboard access

## 📊 Screenshots

### Dashboard Overview

![Dashboard](https://via.placeholder.com/800x400/1e293b/ffffff?text=Real-time+Dashboard)

### Real-time Updates

![Real-time](https://via.placeholder.com/800x400/059669/ffffff?text=Live+Firebase+Updates)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for real-time database capabilities
- React team for the amazing frontend framework
- Tailwind CSS for beautiful styling
- Express.js for robust backend API

## 📞 Support

If you have any questions or need help:

1. Check our [Documentation](FIREBASE_SETUP_GUIDE.md)
2. Review the [Testing Guide](TESTING_GUIDE.md)
3. Open an [Issue](https://github.com/YOUR_USERNAME/iot-security-lock-system/issues)
4. Start a [Discussion](https://github.com/YOUR_USERNAME/iot-security-lock-system/discussions)

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ for IoT security applications
