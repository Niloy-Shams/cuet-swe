# Development Build Setup for Push Notifications

## Why Development Build is Required

Starting from Expo SDK 53, push notifications are **no longer supported in Expo Go**. You must create a development build to test and use push notifications.

## What You Need

- ✅ `expo-dev-client` (already installed)
- ✅ `expo-notifications` (already installed)
- ✅ Android Studio (for Android builds)
- ✅ Physical Android device or emulator

## Setup Steps

### Step 1: Prebuild the Native Projects

This generates the native Android/iOS folders with proper notification configuration.

```bash
npx expo prebuild
```

This will:
- Generate `android/` and `ios/` folders
- Configure push notifications
- Set up all native dependencies

**Note:** If you already have these folders and want to regenerate them:
```bash
npx expo prebuild --clean
```

### Step 2: Build and Run on Android

#### Option A: Using Connected Device (Recommended)

1. **Connect your Android device via USB**
   - Enable USB debugging on your device
   - Check connection: `adb devices`

2. **Run the development build**
   ```bash
   npm run android:dev
   ```
   Or:
   ```bash
   npx expo run:android
   ```

This will:
- Build the app with development client
- Install it on your connected device
- Start the development server

#### Option B: Using Android Emulator

1. **Start Android emulator from Android Studio**

2. **Run the development build**
   ```bash
   npm run android:dev
   ```

### Step 3: Start Development Server

After the app is installed, you can start the dev server:

```bash
npm run start:dev
```

Or simply:
```bash
npx expo start --dev-client
```

## Common Issues and Solutions

### Issue 1: "Android SDK not found"

**Solution:**
- Install Android Studio
- Set up Android SDK
- Add to PATH:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### Issue 2: "adb: device unauthorized"

**Solution:**
- On your device, tap "Allow" when USB debugging permission appears
- If it doesn't appear, revoke USB debugging authorizations in developer settings and reconnect

### Issue 3: Build fails with "Task failed"

**Solution:**
1. Clear cache and rebuild:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

2. If still fails, clean prebuild:
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

### Issue 4: "Metro bundler cannot connect"

**Solution:**
- Make sure device and computer are on the same WiFi network
- Or use `adb reverse`:
  ```bash
  adb reverse tcp:8081 tcp:8081
  ```

## Testing Push Notifications

Once you have the development build running:

1. **Open the app on your device**

2. **Login as a student**
   - Grant notification permissions when prompted

3. **Check logs**
   - Look for: "✅ Push notifications registered with token"
   - Check Firestore to see if push token is saved

4. **Test notifications**
   - Have a teacher publish CT results
   - Or mark student as absent
   - Student should receive notification

## Alternative: Quick Test with Local Notifications

While testing the dev build, you can use local notifications:

```typescript
import { scheduleLocalNotification } from '@/services/notification.service';

// Test in any component
await scheduleLocalNotification(
  'Test Notification',
  'Push notifications are working!',
  2
);
```

## Development Workflow

### First Time Setup
```bash
# 1. Generate native projects
npx expo prebuild

# 2. Build and install on device
npm run android:dev

# 3. The app will be installed and started
```

### Daily Development
```bash
# Just start the dev server (app already installed)
npm run start:dev

# Or
npx expo start --dev-client
```

### After Installing New Native Dependencies
```bash
# Rebuild and reinstall
npm run android:dev
```

## Building for Production

When ready to distribute:

### Option 1: Local Build (Generates APK)
```bash
cd android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: EAS Build (Recommended for Production)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for Android**
   ```bash
   eas build --platform android --profile preview
   ```

5. **For production build**
   ```bash
   eas build --platform android --profile production
   ```

## Checking if Development Build is Working

After installation, you should see:
- ✅ App icon on your device
- ✅ App opens without "Expo Go" branding
- ✅ "expo-dev-client" UI when you shake the device
- ✅ Hot reloading works when you make code changes
- ✅ No warnings about "Expo Go" limitations

## Quick Start Command Summary

```bash
# First time setup
npx expo prebuild
npm run android:dev

# Daily development (after app is installed)
npm run start:dev

# Rebuild after native changes
npm run android:dev

# Clean rebuild
npx expo prebuild --clean
npm run android:dev
```

## Important Notes

1. **The development build needs to be installed only once** (unless you change native dependencies)

2. **Hot reloading still works** - You can make code changes and see them instantly

3. **The app will have your app icon** and name, not "Expo Go"

4. **Push notifications will work** on the development build

5. **You can debug** using React Native Debugger or Chrome DevTools

## What's Different from Expo Go?

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Push Notifications | ❌ Not supported (SDK 53+) | ✅ Fully supported |
| Custom Native Code | ❌ Limited | ✅ Full access |
| App Icon/Name | Expo Go | Your app |
| Installation | Download from store | Build yourself |
| Setup Time | Instant | ~5-10 minutes first time |
| Development Speed | Fast | Fast (after first build) |

## Need Help?

- [Expo Dev Client Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## TL;DR - Quick Start

```bash
# 1. Generate native files
npx expo prebuild

# 2. Connect Android device and run
npm run android:dev

# 3. Wait for build and installation (~5-10 minutes first time)

# 4. App will start automatically

# 5. Login and test push notifications!
```

That's it! Push notifications will now work on your development build. 🎉
