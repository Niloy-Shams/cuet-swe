import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/use-auth';
import { ColorScheme, useTheme } from '@/hooks/use-theme';
import { getCourseAttendance } from '@/services/attendance.service';
import { getCourseStats, getTeacherCourses, getTeacherCourseStatus } from '@/services/course.service';
import { getCourseClassTests } from '@/services/ct.service';
import { ClassTest, Course } from '@/types';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

interface CourseWithStats {
  course: Course;
  studentCount: number;
  teacherCount: number;
}

interface AttendanceRecord {
  courseId: string;
  courseName: string;
  courseCode: string;
  sessionId: string;
  date: Date;
  present: number;
  absent: number;
  percentage: number;
}

interface UpcomingTest {
  courseId: string;
  courseName: string;
  courseCode: string;
  ct: ClassTest;
}

const TeacherHomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { session: { user } } = useAuth();
  const styles = getStyles(colors, width);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<UpcomingTest[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (!user?.email) return;

      // Get all active teacher courses
      const allCourses = await getTeacherCourses(user.email, false);

      // Filter for active courses only (default to active if status not explicitly false)
      const activeCourses: Course[] = [];
      for (const course of allCourses) {
        const isActive = await getTeacherCourseStatus(course.id, user.email);
        if (isActive === false) continue; // explicitly archived
        activeCourses.push(course); // treat undefined or true as active
      }

      // Get stats for each course
      const statsPromises = activeCourses.map(async (course) => {
        const stats = await getCourseStats(course.id);
        return {
          course,
          studentCount: stats?.studentCount ?? 0,
          teacherCount: stats?.teacherCount ?? 0,
        } as CourseWithStats;
      });

      let coursesWithStats = await Promise.all(statsPromises);
      // Sort recent courses first by createdAt if available
      coursesWithStats = coursesWithStats.sort((a, b) => {
        const aTime = (a.course as any)?.createdAt?.toMillis?.() ?? 0;
        const bTime = (b.course as any)?.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setCourses(coursesWithStats);

      // Calculate total students
      const total = coursesWithStats.reduce((sum, c) => sum + (c?.studentCount ?? 0), 0);
      setTotalStudents(total);

      // Get recent attendance records
      const attendancePromises = activeCourses.slice(0, 3).map(async (course) => {
        try {
          const sessions = await getCourseAttendance(course.id);
          // Sort by date and get the 3 most recent
          const sorted = sessions.sort((a, b) => b.date.toMillis() - a.date.toMillis());
          return sorted.slice(0, 3).map((session) => {
            const statuses = Object.values(session.studentStatuses || {});
            const presentCount = statuses.filter((s) => s === 'present').length;
            const absentCount = statuses.filter((s) => s === 'absent').length;
            const total = presentCount + absentCount;
            const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;
            return {
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              sessionId: session.id,
              date: session.date.toDate(),
              present: presentCount,
              absent: absentCount,
              percentage,
            };
          });
        } catch (error) {
          console.error('Error loading attendance:', error);
          return [];
        }
      });

      const allAttendance = (await Promise.all(attendancePromises)).flat();
      // Sort all attendance records by date and take top 3
      const sortedAttendance = allAttendance.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentAttendance(sortedAttendance.slice(0, 3));

      // Calculate average attendance
      if (sortedAttendance.length > 0) {
        const avg = sortedAttendance.reduce((sum, a) => sum + a.percentage, 0) / sortedAttendance.length;
        setAvgAttendance(Math.round(avg));
      }

      // Get upcoming class tests
      const testsPromises = activeCourses.map(async (course) => {
        try {
          const cts = await getCourseClassTests(course.id);
          // Filter published CTs that are in the future
          const now = new Date();
          const upcomingCourseCTs = cts
            .filter((ct) => ct.isPublished && ct.date.toDate() > now)
            .slice(0, 2)
            .map((ct) => ({
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              ct,
            }));
          return upcomingCourseCTs;
        } catch (error) {
          console.error('Error loading class tests:', error);
          return [];
        }
      });

      const allTests = (await Promise.all(testsPromises)).flat();
      // Sort by date and take top 3
      const sortedTests = allTests.sort((a, b) => a.ct.date.toMillis() - b.ct.date.toMillis());
      setUpcomingTests(sortedTests.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/(teacher)/screens/course_details?courseId=${courseId}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section with Primary Color */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerInner}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.profileSection}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user?.name || user?.email || 'T').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.greeting}>
                    <Text style={styles.greetingText}>Hello {user?.name || user?.email || 'Teacher'}</Text>
                    <Text style={styles.title}>Manage Your Classes</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                  <Feather
                    name='bell'
                    size={24}
                    color='#FFFFFF'
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Row (unified with student design) */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="book" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{courses.length}</Text>
              <Text style={styles.statLabel}>Active Courses</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={24} color="#6366F1" />
              </View>
              <Text style={styles.statValue}>{totalStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </Card>
            <Card style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="clipboard" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{upcomingTests.length}</Text>
              <Text style={styles.statLabel}>Upcoming CTs</Text>
            </Card>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Quick Insights */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={[styles.classCard, { flex: 1, paddingVertical: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
                <Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>Upcoming Tests</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 6 }}>{upcomingTests.length}</Text>
            </Card>
            <Card style={[styles.classCard, { flex: 1, paddingVertical: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>Last Attendance</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginTop: 6 }}>
                {recentAttendance.length > 0 ? recentAttendance[0].date.toLocaleDateString() : 'No sessions yet'}
              </Text>
            </Card>
          </View>

          {/* My Courses */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Courses</Text>
            <TouchableOpacity onPress={() => router.push('/(teacher)/(tabs)/courses')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {courses.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No active courses</Text>
              <TouchableOpacity onPress={() => router.push('/(teacher)/(tabs)/courses')}>
                <Text style={[styles.viewAllText, { marginTop: 8 }]}>Go to My Courses</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            courses.slice(0, 3).map((item) => (
              <TouchableOpacity key={item.course.id} onPress={() => handleCoursePress(item.course.id)}>
                <Card style={styles.classCard}>
                  <View style={styles.classCardHeader}>
                    <View style={styles.classInfo}>
                      <View style={styles.classIconContainer}>
                        <Ionicons
                          name='book-outline'
                          size={22}
                          color='#FFFFFF'
                        />
                      </View>
                      <View style={styles.classTextContainer}>
                        <Text style={styles.className} numberOfLines={1}>{item.course.name}</Text>
                        <Text style={styles.classCode}>{item.course.code}</Text>
                      </View>
                    </View>
                    <View style={styles.studentBadge}>
                      <Text style={styles.studentBadgeText}>{item.studentCount}</Text>
                    </View>
                  </View>
                  <View style={styles.classCardFooter}>
                    <View style={styles.classTimeSection}>
                      <Ionicons
                        name='people-outline'
                        size={18}
                        color='#6B7280'
                      />
                      <Text style={styles.classTimeText}>{item.studentCount} students</Text>
                    </View>
                    <TouchableOpacity style={styles.attendanceButton}>
                      <Text style={styles.attendanceButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}

          {/* Recent Attendance */}
          {recentAttendance.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recent Attendance</Text>
              {recentAttendance.map((record, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleCoursePress(record.courseId)}>
                  <Card style={styles.attendanceCard}>
                    <View style={styles.attendanceHeader}>
                      <View style={styles.attendanceLeft}>
                        <Text style={styles.attendanceCourse}>{record.courseName}</Text>
                        <Text style={styles.attendanceDate}>
                          {record.date.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.attendancePercentage}>
                        <Text style={styles.percentageNumber}>{record.percentage}%</Text>
                        <Text style={styles.percentageLabel}>Attendance</Text>
                      </View>
                    </View>
                    <View style={styles.attendanceStats}>
                      <Text style={styles.presentText}>✓ {record.present} Present</Text>
                      <Text style={styles.absentText}>✗ {record.absent} Absent</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Upcoming Tests */}
          {upcomingTests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming Tests</Text>
              {upcomingTests.map((test, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleCoursePress(test.courseId)}>
                  <Card style={styles.testCard}>
                    <View style={styles.testInfo}>
                      <View style={styles.testIconContainer}>
                        <Feather name="clipboard" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.testTextContainer}>
                        <Text style={styles.testCourse} numberOfLines={1}>{test.courseName}</Text>
                        <Text style={styles.testType}>{test.ct.name}</Text>
                      </View>
                    </View>
                    <View style={styles.testDateTime}>
                      <Text style={styles.testDate}>
                        {test.ct.date.toDate().toLocaleDateString()}
                      </Text>
                      <Text style={styles.testTime}>
                        {test.ct.totalMarks} marks
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ColorScheme, width: number) => {
  const isMobile = width < 600;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.mutedForeground,
    },
    viewAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyCard: {
      padding: 32,
      alignItems: 'center',
      borderRadius: 12,
      marginBottom: 16,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.mutedForeground,
    },
    headerWrapper: {
      backgroundColor: colors.primary,
      paddingBottom: 0,
      paddingTop: 50,
    },
    headerInner: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
    },
    headerContent: {
      paddingBottom: 0,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    greeting: {
      marginLeft: 12,
      flex: 1,
    },
    greetingText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.85)',
      fontWeight: '500',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      marginTop: 2,
    },
    notificationButton: {
      padding: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 24,
      marginTop: 12,
    },
    statCard: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIconContainer: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 24,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 16,
      marginTop: 8,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    classCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    classCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: isMobile ? 8 : 12,
    },
    classInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: isMobile ? 8 : 12,
    },
    classTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    classIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    className: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
    },
    classCode: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 2,
    },
    studentBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      flexShrink: 0,
    },
    studentBadgeText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    classCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.muted,
      gap: isMobile ? 6 : 8,
    },
    classTimeSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: isMobile ? 0 : 1,
    },
    classTimeText: {
      fontSize: 13,
      color: '#6B7280',
      fontWeight: '500',
    },
    classRoom: {
      fontSize: 13,
      color: '#6B7280',
      fontWeight: '500',
      flex: isMobile ? 0 : 1,
    },
    attendanceButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      flexShrink: 0,
    },
    attendanceButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    attendanceCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    attendanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    attendanceLeft: {
      flex: 1,
    },
    attendanceCourse: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    attendanceDate: {
      fontSize: 13,
      color: '#9CA3AF',
      marginTop: 2,
      fontWeight: '500',
    },
    attendancePercentage: {
      alignItems: 'center',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      flexShrink: 0,
    },
    percentageNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
    },
    percentageLabel: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2,
    },
    attendanceStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.muted,
      gap: 12,
    },
    presentText: {
      fontSize: 13,
      color: '#10B981',
      fontWeight: '600',
    },
    absentText: {
      fontSize: 13,
      color: '#EF4444',
      fontWeight: '600',
    },
    testCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      gap: 12,
    },
    testInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    testTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    testIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#F59E0B',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    testCourse: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
    },
    testType: {
      fontSize: 13,
      color: '#F59E0B',
      fontWeight: '600',
      marginTop: 2,
    },
    testDateTime: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    testDate: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: '600',
    },
    testTime: {
      fontSize: 12,
      color: '#9CA3AF',
      marginTop: 2,
    },
  });
};

export default TeacherHomeScreen;