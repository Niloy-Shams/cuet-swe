import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/use-auth';
import { ColorScheme, useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView, StyleSheet, Switch, TouchableOpacity,
    View
} from 'react-native';
import LoadingScreen from './loading.screen';

export default function ProfileScreen() {
    const { signOut, session: { user } } = useAuth();
    const { isDarkMode, toggleDarkMode, colors } = useTheme();

    const menuItems = [
        {
            id: '1',
            title: 'Edit Profile',
            icon: 'person-outline',
            color: '#3B82F6',
            onPress: () => Alert.alert('Edit Profile', 'Navigate to edit profile screen'),
        },
        {
            id: '2',
            title: 'My Courses',
            icon: 'book-outline',
            color: '#8B5CF6',
            onPress: () => Alert.alert('My Courses', 'Navigate to courses screen'),
        },
        {
            id: '3',
            title: 'Reports & Analytics',
            icon: 'stats-chart-outline',
            color: '#10B981',
            onPress: () => Alert.alert('Reports', 'Navigate to reports screen'),
        },
        {
            id: '4',
            title: 'Notifications',
            icon: 'notifications-outline',
            color: '#F59E0B',
            onPress: () => Alert.alert('Notifications', 'Navigate to notifications screen'),
        },
    ];

    const settingsItems = [
        {
            id: '1',
            title: 'Dark Mode',
            icon: 'moon-outline',
            hasSwitch: true,
            switchValue: isDarkMode,
            onToggle: toggleDarkMode,
        },
        {
            id: '2',
            title: 'Notifications',
            icon: 'notifications-outline',
            hasSwitch: true,
            switchValue: true,
            onToggle: () => { },
        },
    ];

    const styles = getStyles(colors)

    if (!user) {
        return <LoadingScreen />;
    }

    return (
        <>
            <Container style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View
                            style={styles.avatarGradient}
                        >
                            <Ionicons name="person" size={48} color="#FFFFFF" />
                        </View>

                        <Text style={[styles.userName,]}>
                            {user.name}
                        </Text>
                        <Text style={[styles.userRole,]}>
                            {user.department}
                        </Text>
                        <Text style={[styles.userEmail,]}>
                            {user.email}
                        </Text>
                    </View>

                    {/* Menu Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                            Quick Access
                        </Text>

                        <Card style={[
                            styles.menuContainer,
                        ]}>
                            {menuItems.map((item, index) => (
                                <View key={item.id}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={item.onPress}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.menuIcon,
                                            { backgroundColor: `${item.color}20` }
                                        ]}>
                                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                                        </View>

                                        <Text style={[
                                            styles.menuText,
                                            isDarkMode && styles.menuTextDark
                                        ]}>
                                            {item.title}
                                        </Text>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={isDarkMode ? '#64748B' : '#9CA3AF'}
                                        />
                                    </TouchableOpacity>

                                    {index < menuItems.length - 1 && (
                                        <View style={[
                                            styles.divider,
                                            isDarkMode && styles.dividerDark
                                        ]} />
                                    )}
                                </View>
                            ))}
                        </Card>
                    </View>

                    {/* Settings Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                            Settings
                        </Text>

                        <Card style={styles.menuContainer}>
                            {settingsItems.map((item, index) => (
                                <View key={item.id}>
                                    <View style={styles.menuItem}>
                                        <View style={[
                                            styles.menuIcon,
                                            { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }
                                        ]}>
                                            <Ionicons
                                                name={item.icon as any}
                                                size={22}
                                                color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                                            />
                                        </View>

                                        <Text style={[
                                            styles.menuText,
                                            isDarkMode && styles.menuTextDark
                                        ]}>
                                            {item.title}
                                        </Text>

                                        {item.hasSwitch && (
                                            <Switch
                                                value={item.switchValue}
                                                onValueChange={item.onToggle}
                                                trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
                                                thumbColor={item.switchValue ? '#2563EB' : '#FFFFFF'}
                                            />
                                        )}
                                    </View>

                                    {index < settingsItems.length - 1 && (
                                        <View style={[
                                            styles.divider,
                                            isDarkMode && styles.dividerDark
                                        ]} />
                                    )}
                                </View>
                            ))}
                        </Card>
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                            About
                        </Text>

                        <Card style={styles.menuContainer}>
                            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                                <View style={[
                                    styles.menuIcon,
                                    { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }
                                ]}>
                                    <Ionicons
                                        name="help-circle-outline"
                                        size={22}
                                        color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                                    />
                                </View>
                                <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>
                                    Help & Support
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={isDarkMode ? '#64748B' : '#9CA3AF'}
                                />
                            </TouchableOpacity>

                            <View style={[styles.divider, isDarkMode && styles.dividerDark]} />

                            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                                <View style={[
                                    styles.menuIcon,
                                    { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }
                                ]}>
                                    <Ionicons
                                        name="information-circle-outline"
                                        size={22}
                                        color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                                    />
                                </View>
                                <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>
                                    About CUET Portal
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={isDarkMode ? '#64748B' : '#9CA3AF'}
                                />
                            </TouchableOpacity>

                            <View style={[styles.divider, isDarkMode && styles.dividerDark]} />

                            <View style={styles.menuItem}>
                                <View style={[
                                    styles.menuIcon,
                                    { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }
                                ]}>
                                    <Ionicons
                                        name="code-outline"
                                        size={22}
                                        color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                                    />
                                </View>
                                <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>
                                    Version
                                </Text>
                                <Text style={[styles.versionText, isDarkMode && styles.versionTextDark]}>
                                    1.0.0
                                </Text>
                            </View>
                        </Card>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            {
                                backgroundColor: isDarkMode ? '#7f1d1d64' : '#FEE2E2'
                            }
                        ]}
                        onPress={signOut}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <View style={styles.bottomSpacing} />
                </ScrollView>
            </Container>
        </>
    )
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: colors.accentForeground
    },
    userEmail: {
        fontSize: 14,
        color: colors.mutedForeground
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#1E293B',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 4,
    },
    statValueDark: {
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    statLabelDark: {
        color: '#9CA3AF',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    sectionTitleDark: {
        color: '#FFFFFF',
    },
    menuContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    menuTextDark: {
        color: '#FFFFFF',
    },
    versionText: {
        fontSize: 14,
        color: '#6B7280',
    },
    versionTextDark: {
        color: '#9CA3AF',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerDark: {
        backgroundColor: '#334155',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    logoutButtonLight: {
        backgroundColor: '#FEE2E2',
    },
    logoutButtonDark: {
        backgroundColor: '#7F1D1D',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF4444',
    },
    bottomSpacing: {
        height: 100,
    },
});