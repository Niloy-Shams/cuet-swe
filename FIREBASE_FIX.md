# Firebase Setup for Push Notifications - FIXED

## The Problem

Firebase needs to be properly initialized in your Android app for push notifications to work. The error means the Android app can't find the Firebase configuration.

## Solution - Run These Commands

### Step 1: Install React Native Firebase
```bash
npm install @react-native-firebase/app
```

### Step 2: Copy google-services.json
```bash
# Create directory if it doesn't exist
mkdir android\\app

# Copy the file
copy google-services.json android\\app\\google-services.json
```

### Step 3: Clean Prebuild
```bash
npx expo prebuild --clean
```

### Step 4: Rebuild the App
```bash
npm run android:dev
```

## Why This Fixes the Error

1. **`@react-native-firebase/app`** - Provides native Firebase initialization for Android
2. **`google-services.json`** - Contains your Firebase project configuration
3. **Plugin in app.json** - Tells Expo to configure Firebase during build
4. **Prebuild** - Applies the Firebase configuration to native Android project

## After Setup

Once rebuilt, your app will:
- ✅ Initialize Firebase automatically
- ✅ Support Expo push notifications
- ✅ Register devices successfully
- ✅ Send and receive notifications

## Verification

After the app starts, check logs for:
```
✅ Push notifications registered with token: ExponentPushToken[...]
```

Instead of:
```
❌ Error registering for push notifications: [Error: Make sure to complete...]
```

## If You Still Get Errors

1. **Verify google-services.json is in android/app/**
   ```bash
   ls android/app/google-services.json
   ```

2. **Check the file has correct package name**
   Open `google-services.json` and verify:
   ```json
   {
     "project_info": {...},
     "client": [
       {
         "client_info": {
           "android_client_info": {
             "package_name": "com.cuet.swe"
           }
         }
       }
     ]
   }
   ```

3. **Clean and rebuild**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo prebuild --clean
   npm run android:dev
   ```

## Complete Command Sequence

Just copy and paste these commands one by one:

```bash
npm install @react-native-firebase/app
mkdir android\\app
copy google-services.json android\\app\\google-services.json
npx expo prebuild --clean
npm run android:dev
```

Wait for the build to complete (~5-10 minutes), and notifications will work!
