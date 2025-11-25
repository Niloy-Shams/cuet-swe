# Fix: Setup FCM v1 for Push Notifications

## The Problem

You're getting this error when sending notifications:
```
"Unable to retrieve the FCM server key for the recipient's app."
Error: InvalidCredentials
```

The Legacy FCM API is now disabled (as of June 2024). You must use **FCM v1 API** with a Service Account key.

---

## Solution: Setup FCM v1 (Current Standard)

### Step 1: Enable Firebase Cloud Messaging API (v1)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in your **Firebase project** (top dropdown)
3. Go to **APIs & Services** → **Library**
4. Search for: **"Firebase Cloud Messaging API"** (NOT Legacy)
5. Click on it and press **Enable**
6. Wait 1-2 minutes for activation

### Step 2: Create a Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ (gear icon)** → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key** button
6. Confirm by clicking **Generate key**
7. A JSON file will download automatically
   - Filename: `your-project-name-firebase-adminsdk-xxxxx.json`
   - **Keep this file secure!** It contains sensitive credentials

### Step 3: Upload Service Account to Expo

#### Option A: Using EAS CLI (Recommended)

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to Expo
eas login

# Navigate to your project
cd "E:/level 3 term 2/sw development/project/cuet-swe"

# Configure credentials
eas credentials
```

Follow the prompts:
1. Select: **Android**
2. Select: **production** (or the build profile you're using)
3. Select: **Push Notifications: Manage your FCM API Key**
4. Choose: **Upload FCM V1 service account key**
5. Select the JSON file you downloaded
6. Confirm

#### Option B: Using Expo Website

1. Go to [expo.dev](https://expo.dev)
2. Log in to your account
3. Find and open your project
4. Go to **Project Settings** → **Credentials**
5. Under **Android**, find **FCM Service Account Key**
6. Click **Upload** or **Add credentials**
7. Upload the JSON file you downloaded
8. Save

### Step 4: Verify Setup

After uploading, verify in your Expo project dashboard:
1. Go to [expo.dev](https://expo.dev)
2. Open your project
3. Go to **Credentials** → **Android**
4. You should see: ✅ **FCM Service Account Key** configured

---

## Testing After Setup

After uploading the FCM v1 key:

1. **No app rebuild required** - changes take effect immediately
2. Send a message from teacher app
3. Check the logs

Expected logs after fix:
```
📧 Preparing to send notifications to 1 students
🔔 sendBatchPushNotifications called for 1 users
📊 Push token stats: 1 found, 0 missing
📤 Sending 1 push notifications to Expo server...
📨 Expo push response: {
  "data": [{"status": "ok", "id": "XXXXXXXX-XXXX-XXXX"}]
}
✅ Notifications sent: 1 successful, 0 failed
```

Student device should receive the notification! 🎉

---

## Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure credentials
eas credentials
```

Or use the Expo website: https://expo.dev → Your Project → Credentials

---

## Troubleshooting

### Issue: "EAS CLI not found"

**Solution:**
```bash
npm install -g eas-cli
```

### Issue: "Project not found"

**Solution:**
1. Make sure you have `app.json` or `app.config.js` with correct project ID:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-expo-project-id"
         }
       }
     }
   }
   ```

2. If you don't have a project ID, create one:
   ```bash
   eas init
   ```

### Issue: "Can't find the JSON file"

**Solution:**
The file was downloaded to your Downloads folder. Look for:
- `your-project-name-firebase-adminsdk-xxxxx.json`
- Or check Firebase Console → Service Accounts → Generate new key again

### Issue: Still getting InvalidCredentials

**Solution:**
1. Wait 2-3 minutes for Expo to sync
2. Verify FCM API (v1) is enabled in Google Cloud Console
3. Re-download and re-upload the service account JSON
4. Check you uploaded to the correct Expo account/project

---

## Alternative: Use Expo Application Services (EAS)

If `eas credentials` doesn't work, you can build with EAS which will handle credentials automatically:

```bash
# Install EAS
npm install -g eas-cli

# Login
eas login

# Configure your project
eas build:configure

# Build (this will prompt for FCM credentials)
eas build --platform android --profile development
```

---

## Important Security Notes

⚠️ **Keep the Service Account JSON file secure:**
- Don't commit it to git
- Don't share it publicly
- Add to `.gitignore`:
  ```
  *-firebase-adminsdk-*.json
  ```

---

## Complete Step-by-Step Checklist

- [ ] Enable Firebase Cloud Messaging API (v1) in Google Cloud Console
- [ ] Generate Service Account key from Firebase Console
- [ ] Download the JSON file
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Run: `eas credentials`
- [ ] Select Android → production → Upload FCM V1 key
- [ ] Upload the JSON file
- [ ] Wait 2-3 minutes
- [ ] Test sending notification from teacher app
- [ ] Verify student receives notification

---

## What Changed from Legacy API?

**Before (Legacy - Deprecated):**
- Used Server Key (long string starting with "AAAA...")
- Added via `expo credentials:manager`

**Now (FCM v1 - Current):**
- Uses Service Account JSON file
- More secure and feature-rich
- Added via `eas credentials` or Expo website
- Required since June 2024

---

## Need Help?

### Check These:
1. ✅ FCM API (v1) enabled in Google Cloud Console
2. ✅ Service Account JSON downloaded from Firebase
3. ✅ EAS CLI installed (`npm install -g eas-cli`)
4. ✅ Logged into correct Expo account
5. ✅ Uploaded JSON to correct project
6. ✅ Waited 2-3 minutes after upload

### Still Not Working?

1. **Verify API is enabled:**
   - Google Cloud Console → APIs & Services → Dashboard
   - Search for "Firebase Cloud Messaging API"
   - Should show "Enabled"

2. **Re-download Service Account:**
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Upload again

3. **Check Expo project:**
   - expo.dev → Your Project → Credentials
   - Should show FCM Service Account Key configured

---

## Success Indicators

After completing setup, you should see:

**In Expo Dashboard:**
```
✅ FCM Service Account Key: Configured
```

**In App Logs:**
```
✅ Notifications sent: 1 successful, 0 failed
```

**On Student Device:**
- Notification appears in tray
- App receives the notification

🎉 **Done!** Your push notifications are now working with FCM v1!
