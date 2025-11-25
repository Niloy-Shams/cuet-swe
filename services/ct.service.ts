import { db } from '@/config/firebase.config';
import { ClassTest, Mark, MarkStatus } from '@/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

const generateRandomId = (): string => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

// ========================================================================
// 1. CLASS TEST CRUD
// ========================================================================

/**
 * Create a new class test
 */
export const createClassTest = async (
    courseId: string,
    name: string,
    totalMarks: number,
    teacherEmail: string,
    date?: Date,
    description?: string
): Promise<ClassTest | null> => {
    try {
        if (!courseId || !name || !totalMarks || !teacherEmail) {
            console.error('❌ Missing required fields');
            return null;
        }

        const ctId = generateRandomId();
        const newCT: Omit<ClassTest, 'description'> & { description?: string } = {
            id: ctId,
            courseId,
            name,
            date: date ? Timestamp.fromDate(date) : Timestamp.now(),
            totalMarks,
            isPublished: false,
            createdBy: teacherEmail,
            createdAt: Timestamp.now(),
        };

        // Only add description if provided
        if (description) {
            newCT.description = description;
        }

        await setDoc(doc(db, 'classTests', ctId), newCT);

        console.log(`✅ Class test created: "${name}"`);
        return newCT;
    } catch (error) {
        console.error('❌ Error creating class test:', error);
        return null;
    }
};

/**
 * Get all class tests for a course
 */
export const getCourseClassTests = async (
    courseId: string
): Promise<ClassTest[]> => {
    try {
        if (!courseId) {
            console.error('❌ Missing courseId');
            return [];
        }

        const q = query(
            collection(db, 'classTests'),
            where('courseId', '==', courseId)
        );

        const snapshot = await getDocs(q);
        const classTests = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        } as ClassTest));

        // Sort by date
        classTests.sort((a, b) => a.date.toMillis() - b.date.toMillis());

        console.log(`✅ Fetched ${classTests.length} class tests for course`);
        return classTests;
    } catch (error) {
        console.error('❌ Error fetching class tests:', error);
        return [];
    }
};

/**
 * Get a class test by ID
 */
export const getClassTestById = async (
    ctId: string
): Promise<ClassTest | null> => {
    try {
        if (!ctId) {
            console.error('❌ Missing ctId');
            return null;
        }

        const ctRef = doc(db, 'classTests', ctId);
        const ctSnap = await getDoc(ctRef);

        if (!ctSnap.exists()) {
            console.error('❌ Class test not found');
            return null;
        }

        return { ...ctSnap.data(), id: ctSnap.id } as ClassTest;
    } catch (error) {
        console.error('❌ Error fetching class test:', error);
        return null;
    }
};

/**
 * Update class test details
 */
export const updateClassTest = async (
    ctId: string,
    updates: Partial<ClassTest>
): Promise<boolean> => {
    try {
        if (!ctId) {
            console.error('❌ Missing ctId');
            return false;
        }

        const ctRef = doc(db, 'classTests', ctId);
        await updateDoc(ctRef, updates);

        console.log('✅ Class test updated');
        return true;
    } catch (error) {
        console.error('❌ Error updating class test:', error);
        return false;
    }
};

/**
 * Publish class test (makes marks visible to students)
 */
export const publishClassTest = async (
    ctId: string
): Promise<boolean> => {
    try {
        console.log(`📢 Publishing CT: ${ctId}`);
        const success = await updateClassTest(ctId, { isPublished: true });
        
        if (success) {
            console.log(`✅ CT published successfully, sending notifications...`);
            // Send notifications to students about published results
            await notifyStudentsAboutPublishedCT(ctId);
        } else {
            console.error('❌ Failed to update CT publish status');
        }
        
        return success;
    } catch (error) {
        console.error('❌ Error publishing class test:', error);
        return false;
    }
};

/**
 * Notify students when CT results are published
 * @param ctId - The class test ID
 */
const notifyStudentsAboutPublishedCT = async (
    ctId: string
): Promise<void> => {
    try {
        // Import dynamically to avoid circular dependencies
        const { getCourseById } = await import('./course.service');
        const { sendBatchPushNotifications } = await import('./notification.service');
        
        // Get CT details
        const ct = await getClassTestById(ctId);
        if (!ct) {
            console.error('❌ CT not found for notifications');
            return;
        }
        
        // Get course details
        const course = await getCourseById(ct.courseId);
        if (!course) {
            console.error('❌ Course not found for notifications');
            return;
        }
        
        // Get all marks for this CT
        const marks = await getClassTestMarks(ctId);
        
        if (marks.length === 0) {
            console.log('ℹ️ No marks to notify about');
            return;
        }
        
        console.log(`📧 Sending CT result notifications to ${marks.length} students`);
        
        // Get enrolled students to convert temp emails to real emails if needed
        const { getEnrolledStudents } = await import('./course.service');
        const enrolledStudents = await getEnrolledStudents(ct.courseId);
        
        // Create mapping from student ID to real email
        const idToEmailMap = new Map<number, string>();
        enrolledStudents.forEach(student => {
            idToEmailMap.set(student.studentId, student.email);
        });
        
        // Convert student emails (handle both temp emails and real emails)
        const studentEmails = marks
            .map(mark => {
                // Check if this is a temp email format
                if (mark.studentEmail.includes('@temp.com')) {
                    // Extract student ID from temp email (e.g., student_2104101@temp.com -> 2104101)
                    const match = mark.studentEmail.match(/student_(\d+)@temp\.com/);
                    if (match) {
                        const studentId = parseInt(match[1]);
                        const realEmail = idToEmailMap.get(studentId);
                        if (realEmail) {
                            console.log(`🔄 Converting ${mark.studentEmail} -> ${realEmail}`);
                            return realEmail;
                        } else {
                            console.warn(`⚠️ No real email found for student ID ${studentId}`);
                        }
                    }
                }
                // Return the original email (already real or couldn't convert)
                return mark.studentEmail;
            })
            .filter(email => !email.includes('@temp.com')); // Filter out any remaining temp emails
        
        if (studentEmails.length === 0) {
            console.warn('⚠️ No valid student emails found after conversion');
            return;
        }
        
        console.log(`📤 Sending to ${studentEmails.length} students with valid emails`);
        
        // Send batch notifications
        const title = `CT Result Published - ${course.name}`;
        const body = `Your result for "${ct.name}" has been published. Check the app to view your marks.`;
        
        const result = await sendBatchPushNotifications(
            studentEmails,
            title,
            body,
            {
                type: 'ct_published',
                courseName: course.name,
                courseId: ct.courseId,
                ctId: ct.id,
                ctName: ct.name,
                totalMarks: ct.totalMarks,
            }
        );
        
        console.log(`✅ CT published notifications: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
        console.error('❌ Error sending CT published notifications:', error);
    }
};

/**
 * Delete a class test and all its marks
 * @param ctId - The class test ID
 */
export const deleteClassTest = async (
    ctId: string
): Promise<boolean> => {
    try {
        if (!ctId) {
            console.error('❌ Missing ctId');
            return false;
        }

        // Use batch to delete CT and all marks
        const batch = writeBatch(db);

        // Delete CT document
        const ctRef = doc(db, 'classTests', ctId);
        batch.delete(ctRef);

        // Delete all marks for this CT
        const marksQuery = query(
            collection(db, 'classTests', ctId, 'marks')
        );
        const marksSnap = await getDocs(marksQuery);
        marksSnap.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Commit the batch
        await batch.commit();

        console.log(`✅ Class test ${ctId} deleted successfully`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting class test:', error);
        return false;
    }
};

// ========================================================================
// 2. MARKS MANAGEMENT
// ========================================================================

/**
 * Add or update marks for a student in a class test
 * If status is 'absent', marksObtained should be undefined
 */
export const addOrUpdateMark = async (
    ctId: string,
    courseId: string,
    studentEmail: string,
    studentId: number,
    status: MarkStatus,
    marksObtained?: number,
    feedback?: string
): Promise<boolean> => {
    try {
        if (!ctId || !courseId || !studentEmail || !studentId) {
            console.error('❌ Missing required fields');
            return false;
        }

        const markRef = doc(db, 'classTests', ctId, 'marks', studentEmail);
        const markSnap = await getDoc(markRef);

        const markData: Omit<Mark, 'feedback' | 'marksObtained'> & { feedback?: string; marksObtained?: number } = {
            id: studentEmail,
            courseId,
            ctId,
            studentId,
            studentEmail,
            status,
            createdAt: markSnap.exists()
                ? (markSnap.data() as Mark).createdAt
                : Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        if (status === 'present' && marksObtained !== undefined) {
            markData.marksObtained = marksObtained;
        }
        if (feedback) {
            markData.feedback = feedback;
        }

        await setDoc(markRef, markData);

        console.log(`✅ Mark ${markSnap.exists() ? 'updated' : 'added'} for student`);
        return true;
    } catch (error) {
        console.error('❌ Error adding/updating mark:', error);
        return false;
    }
};

/**
 * Batch update marks for multiple students
 */
export const batchUpdateMarks = async (
    ctId: string,
    courseId: string,
    marks: Array<{
        studentEmail: string;
        studentId: number;
        status: MarkStatus;
        marksObtained?: number;
        feedback?: string;
    }>
): Promise<boolean> => {
    try {
        if (!ctId || !courseId || !marks.length) {
            console.error('❌ Missing required fields');
            return false;
        }

        const batch = writeBatch(db);

        for (const mark of marks) {
            const markRef = doc(db, 'classTests', ctId, 'marks', mark.studentEmail);
            const markSnap = await getDoc(markRef);

            // Build mark data with only defined fields (Firestore doesn't allow undefined)
            const markData: any = {
                id: mark.studentEmail,
                courseId,
                ctId,
                studentId: mark.studentId,
                studentEmail: mark.studentEmail,
                status: mark.status,
                createdAt: markSnap.exists()
                    ? (markSnap.data() as Mark).createdAt
                    : Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            // Only add marksObtained if student is present and has marks
            if (mark.status === 'present' && mark.marksObtained !== undefined) {
                markData.marksObtained = mark.marksObtained;
            }

            // Only add feedback if provided
            if (mark.feedback !== undefined && mark.feedback !== null && mark.feedback !== '') {
                markData.feedback = mark.feedback;
            }

            batch.set(markRef, markData);
        }

        await batch.commit();

        console.log(`✅ Batch updated ${marks.length} marks`);
        return true;
    } catch (error) {
        console.error('❌ Error batch updating marks:', error);
        return false;
    }
};

/**
 * Get all marks for a class test
 */
export const getClassTestMarks = async (
    ctId: string
): Promise<Mark[]> => {
    try {
        if (!ctId) {
            console.error('❌ Missing ctId');
            return [];
        }

        const marksSnapshot = await getDocs(
            collection(db, 'classTests', ctId, 'marks')
        );

        const marks = marksSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        } as Mark));

        console.log(`✅ Fetched ${marks.length} marks for class test`);
        return marks;
    } catch (error) {
        console.error('❌ Error fetching marks:', error);
        return [];
    }
};

/**
 * Get marks for a specific student in a class test
 */
export const getStudentMark = async (
    ctId: string,
    studentEmail: string
): Promise<Mark | null> => {
    try {
        if (!ctId || !studentEmail) {
            console.error('❌ Missing required fields');
            return null;
        }

        const markRef = doc(db, 'classTests', ctId, 'marks', studentEmail);
        const markSnap = await getDoc(markRef);

        if (!markSnap.exists()) {
            return null;
        }

        return { ...markSnap.data(), id: markSnap.id } as Mark;
    } catch (error) {
        console.error('❌ Error fetching student mark:', error);
        return null;
    }
};

/**
 * Get all marks for a student across all class tests in a course
 */
export const getStudentCourseMarks = async (
    courseId: string,
    studentEmail: string
): Promise<Mark[]> => {
    try {
        if (!courseId || !studentEmail) {
            console.error('❌ Missing required fields');
            return [];
        }

        // Get all class tests for the course
        const classTests = await getCourseClassTests(courseId);
        const marks: Mark[] = [];

        for (const ct of classTests) {
            const mark = await getStudentMark(ct.id, studentEmail);
            if (mark) {
                marks.push(mark);
            }
        }

        console.log(`✅ Fetched ${marks.length} marks for student in course`);
        return marks;
    } catch (error) {
        console.error('❌ Error fetching student course marks:', error);
        return [];
    }
};

// ========================================================================
// 3. STATISTICS AND CALCULATIONS
// ========================================================================

/**
 * Calculate class test statistics
 */
export const getClassTestStats = async (
    ctId: string
): Promise<{
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
    averageMarks: number;
    highestMarks: number;
    lowestMarks: number;
} | null> => {
    try {
        const marks = await getClassTestMarks(ctId);

        if (marks.length === 0) {
            return {
                totalStudents: 0,
                presentStudents: 0,
                absentStudents: 0,
                averageMarks: 0,
                highestMarks: 0,
                lowestMarks: 0,
            };
        }

        const presentMarks = marks.filter(m => m.status === 'present' && m.marksObtained !== undefined);
        const presentStudents = presentMarks.length;
        const absentStudents = marks.filter(m => m.status === 'absent').length;

        let averageMarks = 0;
        let highestMarks = 0;
        let lowestMarks = 0;

        if (presentMarks.length > 0) {
            const marksArray = presentMarks.map(m => m.marksObtained!);
            const sum = marksArray.reduce((a, b) => a + b, 0);
            averageMarks = sum / presentMarks.length;
            highestMarks = Math.max(...marksArray);
            lowestMarks = Math.min(...marksArray);
        }

        return {
            totalStudents: marks.length,
            presentStudents,
            absentStudents,
            averageMarks,
            highestMarks,
            lowestMarks,
        };
    } catch (error) {
        console.error('❌ Error calculating class test stats:', error);
        return null;
    }
};

/**
 * Calculate best CT average for a student
 * Uses the course's bestCTCount configuration
 */
export const calculateStudentBestCTAverage = async (
    courseId: string,
    studentEmail: string,
    bestCTCount?: number
): Promise<number> => {
    try {
        const marks = await getStudentCourseMarks(courseId, studentEmail);

        // Filter only present marks with scores
        const presentMarks = marks
            .filter(m => m.status === 'present' && m.marksObtained !== undefined)
            .map(m => m.marksObtained!);

        if (presentMarks.length === 0) {
            return 0;
        }

        // Sort marks in descending order
        presentMarks.sort((a, b) => b - a);

        // Take best N marks (or all if bestCTCount not specified)
        const marksToConsider = bestCTCount
            ? presentMarks.slice(0, Math.min(bestCTCount, presentMarks.length))
            : presentMarks;

        const sum = marksToConsider.reduce((a, b) => a + b, 0);
        return sum / marksToConsider.length;
    } catch (error) {
        console.error('❌ Error calculating best CT average:', error);
        return 0;
    }
};
