import { db } from '@/config/firebase.config';
import { CourseMessage } from '@/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    Timestamp,
    where
} from 'firebase/firestore';
import { getCourseById, getEnrolledStudents } from './course.service';
import { sendBatchPushNotifications } from './notification.service';

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

const generateRandomId = (): string => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

// ========================================================================
// 1. SEND COURSE MESSAGE
// ========================================================================

/**
 * Send a message to all students enrolled in a course
 * @param courseId - The course ID
 * @param title - Message title
 * @param message - Message content
 * @param senderEmail - Teacher's email
 * @param senderName - Teacher's name
 * @returns The created message object or null if failed
 */
export const sendCourseMessage = async (
    courseId: string,
    title: string,
    message: string,
    senderEmail: string,
    senderName: string
): Promise<CourseMessage | null> => {
    try {
        if (!courseId || !title.trim() || !message.trim() || !senderEmail || !senderName) {
            console.error('❌ Missing required fields for sending message');
            return null;
        }

        // Get course details
        const course = await getCourseById(courseId);
        if (!course) {
            console.error('❌ Course not found');
            return null;
        }

        // Get all enrolled students
        const students = await getEnrolledStudents(courseId);
        console.log(`📋 Found ${students.length} enrolled students in course ${course.name}`);
        
        if (students.length === 0) {
            console.warn('⚠️ No students enrolled in this course');
            return null;
        }

        // Create message document
        const messageId = generateRandomId();
        const courseMessage: CourseMessage = {
            id: messageId,
            courseId,
            courseName: course.name,
            title: title.trim(),
            message: message.trim(),
            senderEmail,
            senderName,
            createdAt: Timestamp.now(),
        };

        await setDoc(doc(db, 'courseMessages', messageId), courseMessage);
        console.log('✅ Message document created in Firestore');

        // Send push notifications to all enrolled students
        const studentEmails = students.map(student => student.email);
        console.log(`📧 Preparing to send notifications to ${studentEmails.length} students:`, studentEmails);
        
        const notificationTitle = `${course.name} - ${title}`;
        const notificationBody = message.trim();

        const result = await sendBatchPushNotifications(
            studentEmails,
            notificationTitle,
            notificationBody,
            {
                type: 'course_message',
                courseId,
                courseName: course.name,
                messageId,
            }
        );

        console.log(`✅ Message sent to course: ${course.name}`);
        console.log(`📧 Notifications: ${result.sent} sent, ${result.failed} failed`);
        
        if (result.failed > 0) {
            console.warn(`⚠️ ${result.failed} notifications failed to send. Students may not have push tokens registered.`);
        }

        return courseMessage;
    } catch (error) {
        console.error('❌ Error sending course message:', error);
        return null;
    }
};

// ========================================================================
// 2. GET COURSE MESSAGES
// ========================================================================

/**
 * Get all messages for a specific course
 * @param courseId - The course ID
 * @param limitCount - Optional limit on number of messages to fetch
 * @returns Array of course messages
 */
export const getCourseMessages = async (
    courseId: string,
    limitCount?: number
): Promise<CourseMessage[]> => {
    try {
        if (!courseId) {
            console.error('❌ Course ID required');
            return [];
        }

        let q = query(
            collection(db, 'courseMessages'),
            where('courseId', '==', courseId),
            orderBy('createdAt', 'desc')
        );

        if (limitCount) {
            q = query(q, limit(limitCount));
        }

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        } as CourseMessage));

        console.log(`✅ Fetched ${messages.length} messages for course ${courseId}`);
        return messages;
    } catch (error) {
        console.error('❌ Error fetching course messages:', error);
        return [];
    }
};

/**
 * Get recent messages across all courses for a student
 * @param studentEmail - The student's email
 * @param limitCount - Optional limit on number of messages to fetch
 * @returns Array of course messages
 */
export const getStudentMessages = async (
    studentEmail: string,
    limitCount: number = 10
): Promise<CourseMessage[]> => {
    try {
        if (!studentEmail) {
            console.error('❌ Student email required');
            return [];
        }

        // Get all courses the student is enrolled in
        const { getStudentCourses } = await import('./course.service');
        const studentsRef = collection(db, 'students');
        const studentQuery = query(studentsRef, where('email', '==', studentEmail));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            console.error('❌ Student not found');
            return [];
        }

        const studentData = studentSnapshot.docs[0].data();
        const studentId = studentData.studentId;

        const courses = await getStudentCourses(studentEmail, studentId, true);
        const courseIds = courses.map(course => course.id);

        if (courseIds.length === 0) {
            return [];
        }

        // Get messages for all enrolled courses
        const q = query(
            collection(db, 'courseMessages'),
            where('courseId', 'in', courseIds.slice(0, 10)), // Firestore 'in' query limited to 10
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        } as CourseMessage));

        console.log(`✅ Fetched ${messages.length} messages for student ${studentEmail}`);
        return messages;
    } catch (error) {
        console.error('❌ Error fetching student messages:', error);
        return [];
    }
};

/**
 * Get a specific message by ID
 * @param messageId - The message ID
 * @returns The message object or null if not found
 */
export const getMessageById = async (
    messageId: string
): Promise<CourseMessage | null> => {
    try {
        if (!messageId) {
            console.error('❌ Message ID required');
            return null;
        }

        const messageRef = doc(db, 'courseMessages', messageId);
        const messageSnap = await getDoc(messageRef);

        if (!messageSnap.exists()) {
            console.error('❌ Message not found');
            return null;
        }

        return { ...messageSnap.data(), id: messageSnap.id } as CourseMessage;
    } catch (error) {
        console.error('❌ Error fetching message:', error);
        return null;
    }
};
