import { db } from '@/config/firebase.config';
import { getRole } from '@/utils/role';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ========================================================================
// 1. DEVICE TOKEN REGISTRATION
// ========================================================================

/**
 * Register device for push notifications and save token to Firestore
 * @param userEmail - The user's email
 * @returns The push token or null if registration failed
 */
export const registerForPushNotifications = async (
    userEmail: string
): Promise<string | null> => {
    try {
        if (!userEmail) {
            console.error('❌ No email provided');
            return null;
        }

        // Check if running on physical device
        if (!Device.isDevice) {
            console.warn('⚠️ Push notifications only work on physical devices');
            return null;
        }

        // Get existing notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permission if not already granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('⚠️ Notification permission not granted');
            return null;
        }

        // Resolve projectId for bare / prebuild workflow
        // Priority order:
        // 1. app.json extra.eas.projectId (managed / prebuild)
        // 2. Constants.easConfig?.projectId (newer Expo versions)
        const projectId = (Constants?.expoConfig as any)?.extra?.eas?.projectId || (Constants as any)?.easConfig?.projectId;

        if (!projectId) {
            console.warn('⚠️ No Expo EAS projectId found. Run `npx eas init` and add `extra.eas.projectId` to app.json. Skipping push token registration.');
            return null;
        }

        let token: string | null = null;
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            token = tokenData.data;
        } catch (tokenError) {
            console.error('❌ Failed to fetch Expo push token. Verify projectId is correct and you ran `eas init`.', tokenError);
            return null;
        }

        // Save token to Firestore
        await savePushTokenToFirestore(userEmail, token);

        // Configure notification channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        console.log('✅ Push token registered:', token);
        return token;
    } catch (error) {
        console.error('❌ Error registering for push notifications:', error);
        return null;
    }
};

/**
 * Save push token to user's Firestore document
 */
const savePushTokenToFirestore = async (
    userEmail: string,
    pushToken: string
): Promise<boolean> => {
    try {
        const role = getRole(userEmail);
        if (!role) {
            console.error('❌ Invalid role for user:', userEmail);
            return false;
        }

        const collectionName = role === 'teacher' ? 'teachers' : 'students';
        const userRef = doc(db, collectionName, userEmail);

        await updateDoc(userRef, {
            pushToken,
            pushTokenUpdatedAt: new Date().toISOString(),
        });

        console.log(`✅ Push token saved to ${collectionName} for:`, userEmail);
        return true;
    } catch (error) {
        console.error('❌ Error saving push token:', error);
        return false;
    }
};

// ========================================================================
// 2. GET USER PUSH TOKENS
// ========================================================================

/**
 * Get push token for a specific user
 */
export const getUserPushToken = async (
    userEmail: string
): Promise<string | null> => {
    try {
        const role = getRole(userEmail);
        if (!role) {
            console.error('❌ Invalid role for user:', userEmail);
            return null;
        }

        const collectionName = role === 'teacher' ? 'teachers' : 'students';
        const userRef = doc(db, collectionName, userEmail);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.error('❌ User not found:', userEmail);
            return null;
        }

        const userData = userSnap.data();
        return userData.pushToken || null;
    } catch (error) {
        console.error('❌ Error getting push token:', error);
        return null;
    }
};

/**
 * Get push tokens for multiple users
 */
export const getUsersPushTokens = async (
    userEmails: string[]
): Promise<string[]> => {
    try {
        const tokens: string[] = [];
        let tokensFound = 0;
        let tokensMissing = 0;

        for (const email of userEmails) {
            const token = await getUserPushToken(email);
            if (token) {
                tokens.push(token);
                tokensFound++;
            } else {
                tokensMissing++;
                console.warn(`⚠️ No push token found for: ${email}`);
            }
        }

        console.log(`📊 Push token stats: ${tokensFound} found, ${tokensMissing} missing out of ${userEmails.length} users`);
        return tokens;
    } catch (error) {
        console.error('❌ Error getting push tokens:', error);
        return [];
    }
};

// ========================================================================
// 3. SEND NOTIFICATIONS
// ========================================================================

/**
 * Send push notification to a single user
 */
export const sendPushNotification = async (
    userEmail: string,
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<boolean> => {
    try {
        const token = await getUserPushToken(userEmail);
        if (!token) {
            console.warn('⚠️ No push token found for user:', userEmail);
            return false;
        }

        const message = {
            to: token,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();

        if (result.data?.status === 'error') {
            console.error('❌ Failed to send notification:', result.data);
            return false;
        }

        console.log('✅ Notification sent to:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Error sending push notification:', error);
        return false;
    }
};

/**
 * Send push notification to multiple users
 */
export const sendBatchPushNotifications = async (
    userEmails: string[],
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<{ sent: number; failed: number }> => {
    try {
        console.log(`🔔 sendBatchPushNotifications called for ${userEmails.length} users`);
        const tokens = await getUsersPushTokens(userEmails);

        if (tokens.length === 0) {
            console.warn('⚠️ No valid push tokens found - students may not have registered for notifications');
            return { sent: 0, failed: userEmails.length };
        }

        console.log(`📤 Sending ${tokens.length} push notifications to Expo server...`);
        const messages = tokens.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data: data || {},
        }));

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        const result = await response.json();
        console.log('📨 Expo push response:', JSON.stringify(result, null, 2));

        // Count successes and failures
        let sent = 0;
        let failed = 0;

        if (Array.isArray(result.data)) {
            result.data.forEach((item: any) => {
                if (item.status === 'ok') {
                    sent++;
                } else {
                    failed++;
                    console.error('❌ Notification failed:', item);
                }
            });
        } else if (result.data && result.data.status === 'ok') {
            sent = 1;
        } else if (result.data && result.data.status === 'error') {
            failed = 1;
            console.error('❌ Notification failed:', result.data);
        }

        console.log(`✅ Notifications sent: ${sent} successful, ${failed} failed`);
        return { sent, failed };
    } catch (error) {
        console.error('❌ Error sending batch notifications:', error);
        return { sent: 0, failed: userEmails.length };
    }
};

// ========================================================================
// 4. SPECIFIC NOTIFICATION TYPES
// ========================================================================

/**
 * Notify student about published CT result
 */
export const notifyStudentCTPublished = async (
    studentEmail: string,
    courseName: string,
    ctName: string,
    marksObtained?: number,
    totalMarks?: number
): Promise<boolean> => {
    const title = `CT Result Published - ${courseName}`;
    let body = `Your result for "${ctName}" has been published.`;
    
    if (marksObtained !== undefined && totalMarks !== undefined) {
        body += ` You scored ${marksObtained}/${totalMarks}.`;
    }

    return await sendPushNotification(studentEmail, title, body, {
        type: 'ct_published',
        courseName,
        ctName,
        marksObtained,
        totalMarks,
    });
};

/**
 * Notify student about being marked absent
 */
export const notifyStudentAbsent = async (
    studentEmail: string,
    courseName: string,
    date: Date
): Promise<boolean> => {
    const title = `Attendance Alert - ${courseName}`;
    const body = `You were marked absent on ${date.toLocaleDateString()}.`;

    return await sendPushNotification(studentEmail, title, body, {
        type: 'attendance_absent',
        courseName,
        date: date.toISOString(),
    });
};

/**
 * Batch notify students about published CT results
 */
export const notifyStudentsCTPublished = async (
    students: Array<{ email: string; marksObtained?: number }>,
    courseName: string,
    ctName: string,
    totalMarks: number
): Promise<{ sent: number; failed: number }> => {
    try {
        let sent = 0;
        let failed = 0;

        // Send individual notifications to include personalized marks
        for (const student of students) {
            const success = await notifyStudentCTPublished(
                student.email,
                courseName,
                ctName,
                student.marksObtained,
                totalMarks
            );

            if (success) {
                sent++;
            } else {
                failed++;
            }
        }

        return { sent, failed };
    } catch (error) {
        console.error('❌ Error sending batch CT notifications:', error);
        return { sent: 0, failed: students.length };
    }
};

/**
 * Batch notify absent students
 */
export const notifyAbsentStudents = async (
    absentStudentEmails: string[],
    courseName: string,
    date: Date
): Promise<{ sent: number; failed: number }> => {
    const title = `Attendance Alert - ${courseName}`;
    const body = `You were marked absent on ${date.toLocaleDateString()}.`;

    return await sendBatchPushNotifications(absentStudentEmails, title, body, {
        type: 'attendance_absent',
        courseName,
        date: date.toISOString(),
    });
};

/**
 * Notify students about a new course message
 */
export const notifyCourseMessage = async (
    studentEmails: string[],
    courseName: string,
    messageTitle: string,
    messageBody: string,
    courseId: string,
    messageId: string
): Promise<{ sent: number; failed: number }> => {
    const title = `${courseName} - ${messageTitle}`;
    const body = messageBody;

    return await sendBatchPushNotifications(studentEmails, title, body, {
        type: 'course_message',
        courseName,
        courseId,
        messageId,
    });
};

// ========================================================================
// 5. LOCAL NOTIFICATIONS (FOR TESTING)
// ========================================================================

/**
 * Schedule a local notification (useful for testing)
 */
export const scheduleLocalNotification = async (
    title: string,
    body: string,
    seconds: number = 2
): Promise<string | null> => {
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds,
            },
        });

        console.log('✅ Local notification scheduled:', id);
        return id;
    } catch (error) {
        console.error('❌ Error scheduling local notification:', error);
        return null;
    }
};
