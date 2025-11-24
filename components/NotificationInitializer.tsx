import { useNotifications } from '@/hooks/use-notifications';
import { useEffect } from 'react';

/**
 * Component to initialize push notifications
 * Should be placed at the root of authenticated user layouts
 */
export const NotificationInitializer = () => {
    const { expoPushToken } = useNotifications();

    useEffect(() => {
        if (expoPushToken) {
            console.log('📲 Notifications initialized with token:', expoPushToken);
        }
    }, [expoPushToken]);

    // This component doesn't render anything
    return null;
};
