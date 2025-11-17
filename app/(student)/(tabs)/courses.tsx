import { StudentCourseCard } from '@/components/students/StudentCourseCard';
import { Container } from '@/components/ui/container';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/use-auth';
import { ColorScheme, useTheme } from '@/hooks/use-theme';
import {
    getStudentCourses,
    getStudentCourseStatus,
    toggleStudentCourseStatus,
} from '@/services/course.service';
import { Course } from '@/types';
import { extractStudentIdFromEmail } from '@/utils/role';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// Wrapper type that includes user-specific active status
interface CourseWithStatus extends Course {
    isActive: boolean;
}

type TabType = 'active' | 'archived';

export default function StudentCoursesScreen() {
    const { colors } = useTheme();
    const { session: { user } } = useAuth();
    const [courses, setCourses] = useState<CourseWithStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('active');

    // Load courses on mount
    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setRefreshing(true);
            if (!user?.email) return;

            // Extract student ID from email
            const studentId = extractStudentIdFromEmail(user.email);
            if (!studentId) {
                console.error('Invalid student email format');
                return;
            }

            // Load all courses (active + archived)
            const studentCourses = await getStudentCourses(user.email, studentId, false);

            // For each course, get its active status for this student
            const coursesWithStatus: CourseWithStatus[] = await Promise.all(
                studentCourses.map(async (course) => {
                    const isActive = await getStudentCourseStatus(user.email!, course.id);
                    return {
                        ...course,
                        isActive,
                    };
                })
            );

            setCourses(coursesWithStatus);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCoursePress = (course: Course) => {
        router.push(`/(student)/screens/course_details?courseId=${course.id}`);
    };

    const handleToggleArchive = async (course: CourseWithStatus) => {
        try {
            if (!user?.email) return;

            const success = await toggleStudentCourseStatus(
                user.email,
                course.id,
                !course.isActive // Toggle: if active, make inactive; if inactive, make active
            );

            if (success) {
                await loadCourses();
            } else {
                Alert.alert('Error', 'Failed to update course status');
            }
        } catch (error) {
            console.error('Error toggling archive:', error);
            Alert.alert('Error', 'Failed to update course status');
        }
    };

    // Filter courses based on search and active tab
    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchText.toLowerCase()) ||
            course.code.toLowerCase().includes(searchText.toLowerCase());

        const matchesTab = activeTab === 'active' ? course.isActive : !course.isActive;

        return matchesSearch && matchesTab;
    });

    const styles = getStyles(colors);

    const renderRightActions = (course: CourseWithStatus) => {
        return (
            <TouchableOpacity
                style={[
                    styles.swipeAction,
                    course.isActive ? styles.archiveAction : styles.unarchiveAction,
                ]}
                onPress={() => handleToggleArchive(course)}
            >
                <Ionicons
                    name={course.isActive ? 'archive' : 'arrow-undo'}
                    size={24}
                    color="#fff"
                />
                <Text style={styles.swipeActionText}>
                    {course.isActive ? 'Archive' : 'Unarchive'}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderCourseCard = ({ item }: { item: CourseWithStatus }) => (
        <Swipeable
            renderRightActions={() => renderRightActions(item)}
            overshootRight={false}
        >
            <StudentCourseCard
                course={item}
                colors={colors}
                onCoursePress={handleCoursePress}
            />
        </Swipeable>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Container style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons
                            name="search"
                            size={20}
                            color={colors.mutedForeground}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search courses..."
                            placeholderTextColor={colors.mutedForeground}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color={colors.mutedForeground}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'active' && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'active' && styles.tabTextActive,
                            ]}
                        >
                            Active
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'archived' && styles.tabActive,
                        ]}
                        onPress={() => setActiveTab('archived')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'archived' && styles.tabTextActive,
                            ]}
                        >
                            Archived
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Courses List */}
                {refreshing && courses.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredCourses}
                        renderItem={renderCourseCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onRefresh={loadCourses}
                        refreshing={refreshing}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name={activeTab === 'active' ? 'book-outline' : 'archive-outline'}
                                    size={64}
                                    color={colors.mutedForeground}
                                />
                                <Text style={styles.emptyTitle}>
                                    {activeTab === 'active' ? 'No active courses' : 'No archived courses'}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {activeTab === 'active'
                                        ? 'Your enrolled courses will appear here'
                                        : 'Swipe left on a course to archive it'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </Container>
        </GestureHandlerRootView>
    );
}

const getStyles = (colors: ColorScheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        searchContainer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.background,
        },
        searchInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            height: 48,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            fontSize: 15,
            color: colors.foreground,
        },
        tabsContainer: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 8,
        },
        tab: {
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        tabActive: {
            backgroundColor: colors.primary + '15',
            borderColor: colors.primary,
        },
        tabText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.mutedForeground,
        },
        tabTextActive: {
            color: colors.primary,
        },
        listContent: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 12,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 48,
        },
        swipeAction: {
            justifyContent: 'center',
            alignItems: 'center',
            width: 88,
            marginBottom: 12,
            borderRadius: 12,
        },
        archiveAction: {
            backgroundColor: '#f59e0b',
        },
        unarchiveAction: {
            backgroundColor: colors.primary,
        },
        swipeActionText: {
            color: '#fff',
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 48,
            paddingHorizontal: 32,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.foreground,
            marginTop: 16,
            marginBottom: 8,
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.mutedForeground,
            textAlign: 'center',
        },
    });