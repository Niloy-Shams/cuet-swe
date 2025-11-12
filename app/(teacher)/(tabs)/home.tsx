import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ColorScheme, useTheme } from '@/hooks/use-theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

interface ClassItem {
  id: number;
  name: string;
  code: string;
  students: number;
  time: string;
  room: string;
}

interface AttendanceRecord {
  date: string;
  course: string;
  present: number;
  absent: number;
  percentage: number;
}

interface TestItem {
  id: number;
  course: string;
  type: string;
  date: string;
  time: string;
}

const TeacherHomeScreen: React.FC = () => {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const styles = getStyles(colors, width)

  const classes: ClassItem[] = [
    { id: 1, name: 'Computer Networks', code: 'CSE401', students: 45, time: '9:00 AM', room: 'Room 301' },
    { id: 2, name: 'Database Systems', code: 'CSE302', students: 38, time: '11:00 AM', room: 'Room 205' },
    { id: 3, name: 'Software Engineering', code: 'CSE403', students: 42, time: '2:00 PM', room: 'Room 401' },
  ];

  const recentAttendance: AttendanceRecord[] = [
    { date: 'Dec 8, 2021', course: 'CSE401', present: 42, absent: 3, percentage: 93 },
    { date: 'Dec 7, 2021', course: 'CSE302', present: 35, absent: 3, percentage: 92 },
    { date: 'Dec 6, 2021', course: 'CSE403', present: 38, absent: 4, percentage: 90 },
  ];

  const upcomingTests: TestItem[] = [
    { id: 1, course: 'Computer Networks', type: 'Midterm', date: 'Dec 15, 2021', time: '10:00 AM' },
    { id: 2, course: 'Database Systems', type: 'Quiz', date: 'Dec 12, 2021', time: '11:00 AM' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section with Primary Color */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerInner}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.profileSection}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>SC</Text>
                  </View>
                  <View style={styles.greeting}>
                    <Text style={styles.greetingText}>Hello Dr. Sarah</Text>
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

          {/* Overlapping Stats Card */}
          <Card style={styles.statsCard}>
            {
              [
                { value: 3, label: 'Classes' },
                { value: 125, label: 'Students' },
                { value: '91%', label: 'Attendance' },
              ].map((item, i) => (
                <View style={[styles.statItem, i>0 && i<2 && styles.statItemBorder]} key={i}>
                  <Text style={styles.statNumber}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))
            }
          </Card>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Today's Classes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons
                name='add'
                size={22}
                color='#FFFFFF'
              />
              <Text style={styles.addButtonText}>Add Class</Text>
            </TouchableOpacity>
          </View>

          {classes.map((cls) => (
            <Card key={cls.id} style={styles.classCard}>
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
                    <Text style={styles.className} numberOfLines={1}>{cls.name}</Text>
                    <Text style={styles.classCode}>{cls.code}</Text>
                  </View>
                </View>
                <View style={styles.studentBadge}>
                  <Text style={styles.studentBadgeText}>{cls.students}</Text>
                </View>
              </View>
              <View style={styles.classCardFooter}>
                <View style={styles.classTimeSection}>
                  <Feather
                    name='clock'
                    size={18}
                    color='#6B7280'
                  />
                  <Text style={styles.classTimeText}>{cls.time}</Text>
                </View>
                <Text style={styles.classRoom}>{cls.room}</Text>
                <TouchableOpacity style={styles.attendanceButton}>
                  <Text style={styles.attendanceButtonText}>Attendance</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}

          {/* Recent Attendance */}
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {recentAttendance.map((record, idx) => (
            <Card key={idx} style={styles.attendanceCard}>
              <View style={styles.attendanceHeader}>
                <View style={styles.attendanceLeft}>
                  <Text style={styles.attendanceCourse}>{record.course}</Text>
                  <Text style={styles.attendanceDate}>{record.date}</Text>
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
          ))}

          {/* Upcoming Tests */}
          <Text style={styles.sectionTitle}>Upcoming Tests</Text>
          {upcomingTests.map((test) => (
            <Card key={test.id} style={styles.testCard}>
              <View style={styles.testInfo}>
                <View style={styles.testIconContainer}>
                  <Feather name="clipboard" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.testTextContainer}>
                  <Text style={styles.testCourse} numberOfLines={1}>{test.course}</Text>
                  <Text style={styles.testType}>{test.type}</Text>
                </View>
              </View>
              <View style={styles.testDateTime}>
                <Text style={styles.testDate}>{test.date}</Text>
                <Text style={styles.testTime}>{test.time}</Text>
              </View>
            </Card>
          ))}
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
    statsCard: {
      borderRadius: 20,
      borderWidth: 0,
      padding: 20,
      backgroundColor: '#fff',
      marginHorizontal: 24,
      marginBottom: 40,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statItemBorder: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.muted,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: '#000',
      marginTop: 6,
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