# Firebase Setup Guide - Step by Step

This guide will walk you through setting up Firebase for your IoT Security Lock System.

## Step 1: Create Firebase Project

1. **Go to Firebase Console**

   - Open your browser and go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**

   - Click "Create a project" or "Add project"
   - Enter project name: `iot-security-lock` (or your preferred name)
   - Click "Continue"

3. **Configure Google Analytics** (Optional)
   - You can disable Google Analytics for this project or keep it enabled
   - Click "Create project"
   - Wait for the project to be created (takes 1-2 minutes)

## Step 2: Enable Realtime Database

1. **Navigate to Realtime Database**

   - In your Firebase project console, click on "Realtime Database" in the left sidebar
   - Click "Create Database"

2. **Choose Database Location**

   - Select a location close to your users (e.g., us-central1)
   - Click "Next"

3. **Set Security Rules**

   - For development, choose "Start in test mode"
   - Click "Enable"

   **Important**: Test mode allows read/write access for 30 days. We'll update rules later.

4. **Note Your Database URL**
   - After creation, you'll see your database URL like:
   - `https://your-project-id-default-rtdb.firebaseio.com/`
   - **Copy this URL** - you'll need it later

## Step 3: Get Web App Configuration

1. **Add Web App to Project**

   - In project overview, click the web icon `</>`
   - Enter app nickname: `security-lock-dashboard`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Firebase Config**
   - You'll see a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project-id.firebaseapp.com",
     databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456789",
   };
   ```
   - **Copy all these values** - you'll need them for frontend configuration

## Step 4: Generate Service Account Key (Backend)

1. **Go to Project Settings**

   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Navigate to Service Accounts**

   - Click on "Service accounts" tab
   - You'll see "Firebase Admin SDK" section

3. **Generate Private Key**

   - Click "Generate new private key"
   - A dialog will appear warning about keeping the key secure
   - Click "Generate key"
   - A JSON file will download automatically
   - **Keep this file secure** - it contains sensitive credentials

4. **Note the Service Account Details**
   - From the downloaded JSON file, you'll need these values:
     - `project_id`
     - `private_key_id`
     - `private_key`
     - `client_email`
     - `client_id`

## Step 5: Configure Backend Environment

1. **Create .env file in backend folder**

   ```bash
   # In your backend directory
   copy .env.example .env
   ```

2. **Edit backend/.env file**

   - Open the `.env` file and replace with your actual values:

   ```env
   FIREBASE_PROJECT_ID=your-actual-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id-from-json
   ```

   **Important Notes:**

   - Replace `your-actual-project-id` with your Firebase project ID
   - The `FIREBASE_PRIVATE_KEY` should include the full key with `\n` for line breaks
   - Copy the exact email from the JSON file for `FIREBASE_CLIENT_EMAIL`

## Step 6: Configure Frontend Environment

1. **Create .env file in frontend folder**

   ```bash
   # In your frontend directory
   copy .env.example .env
   ```

2. **Edit frontend/.env file**
   - Open the `.env` file and replace with values from Step 3:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-from-config
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## Step 7: Test the Setup

1. **Start Backend Server**

   ```bash
   cd backend
   node index.js
   ```

   - You should see: "Firebase initialized successfully"
   - If you see errors, check your `.env` file values

2. **Start Frontend Server**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the Connection**
   - Login to dashboard (admin/admin123)
   - Toggle to "Firebase Live" mode
   - Use the test panel to add sample data
   - Data should appear in real-time

## Step 8: Verify in Firebase Console

1. **Check Realtime Database**

   - Go back to Firebase Console
   - Click "Realtime Database"
   - You should see an `access_logs` node with your test data

2. **View Real-time Updates**
   - Keep the Firebase console open
   - Add data through your app
   - Watch it appear instantly in the Firebase console

## Step 9: Update Security Rules (Production)

When ready for production, update your database rules:

1. **Go to Realtime Database Rules**

   - In Firebase Console, go to Realtime Database
   - Click "Rules" tab

2. **Update Rules**
   ```json
   {
     "rules": {
       "access_logs": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```

## Troubleshooting

### Common Issues:

1. **"Firebase not configured" error**

   - Check your `.env` files exist and have correct values
   - Restart your servers after changing `.env` files

2. **"Permission denied" error**

   - Check your database rules
   - For development, use test mode rules

3. **"Invalid private key" error**

   - Ensure the private key includes proper line breaks (`\n`)
   - Check that the key is wrapped in quotes

4. **Frontend stuck on loading**
   - Toggle to "API Mode" first
   - Check browser console for errors
   - Verify frontend `.env` file

### Testing Commands:

```bash
# Test backend API
curl http://localhost:5000/api/logs

# Test adding data
curl -X POST http://localhost:5000/api/test-log
```

## Security Notes

- Never commit `.env` files to version control
- Keep your service account JSON file secure
- Use environment-specific Firebase projects (dev/staging/prod)
- Update database rules before going to production

## Next Steps

Once Firebase is working:

- Set up Firebase Authentication for user management
- Add more security rules
- Set up Firebase Cloud Functions for advanced logic
- Configure Firebase Hosting for deployment

Your IoT Security Lock System is now ready with real-time Firebase integration!
