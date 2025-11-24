import { registerForPushNotifications } from '@/services/notification.service';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';

/**
 * Custom hook to manage push notifications
 * 
 * Features:
 * - Registers device for push notifications
 * - Handles notification permissions
 * - Listens for incoming notifications
 * - Provides notification response handling
 */
export const useNotifications = () => {
    const { session } = useAuth();
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        // Register for push notifications when user is available
        if (session.user?.email) {
            registerForPushNotificationsAsync();
        }

        // Listen for notifications while app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('📬 Notification received:', notification);
            setNotification(notification);
        });

        // Listen for notification responses (user tapped on notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('📱 Notification tapped:', response);
            handleNotificationResponse(response);
        });

        // Cleanup listeners on unmount
        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [session.user?.email]);

    /**
     * Register device for push notifications
     */
    const registerForPushNotificationsAsync = async () => {
        try {
            if (!session.user?.email) {
                console.warn('⚠️ No user email available for notification registration');
                return;
            }

            const token = await registerForPushNotifications(session.user.email);
            if (token) {
                setExpoPushToken(token);
                console.log('✅ Push notifications registered with token:', token);
            }
        } catch (error) {
            console.error('❌ Error registering for push notifications:', error);
        }
    };

    /**
     * Handle notification response (when user taps on notification)
     */
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data;
        
        // Handle different notification types
        if (data.type === 'ct_published') {
            console.log('🎓 Navigate to CT details:', {
                courseName: data.courseName,
                ctName: data.ctName,
                marksObtained: data.marksObtained,
                totalMarks: data.totalMarks,
            });
            // TODO: Navigate to CT details screen
            // navigation.navigate('CourseDetails', { courseId: data.courseId, tab: 'CT' });
        } else if (data.type === 'attendance_absent') {
            console.log('📅 Navigate to attendance:', {
                courseName: data.courseName,
                date: data.date,
            });
            // TODO: Navigate to attendance screen
            // navigation.navigate('CourseDetails', { courseId: data.courseId, tab: 'Attendance' });
        }
    };

    /**
     * Request notification permissions manually
     */
    const requestPermissions = async (): Promise<boolean> => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('❌ Error requesting notification permissions:', error);
            return false;
        }
    };

    /**
     * Check current notification permission status
     */
    const checkPermissions = async (): Promise<boolean> => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('❌ Error checking notification permissions:', error);
            return false;
        }
    };

    return {
        expoPushToken,
        notification,
        requestPermissions,
        checkPermissions,
    };
};
