import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ColorScheme } from '@/hooks/use-theme';
import { ClassTest, Mark } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface CTTabProps {
    classTests: ClassTest[];
    marks: Record<string, Mark[]>;
    colors: ColorScheme;
    onCreateCT: () => void;
    onAddMarks: (ct: ClassTest) => void;
    onPublishToggle: (ct: ClassTest) => void;
    calculateCTAverage: (ctId: string) => number;
}

export const CTTab: React.FC<CTTabProps> = ({
    classTests,
    marks,
    colors,
    onCreateCT,
    onAddMarks,
    onPublishToggle,
    calculateCTAverage,
}) => {
    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Class Tests</Text>
                    <Button onPress={onCreateCT}>
                        <Ionicons name="add" size={20} color={colors.primaryForeground} />
                        <Text style={{ color: colors.primaryForeground, marginLeft: 4 }}>Create CT</Text>
                    </Button>
                </View>

                {classTests.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
                        <Text style={styles.emptyText}>No class tests yet</Text>
                        <Text style={styles.emptySubtext}>Create a CT to get started</Text>
                    </Card>
                ) : (
                    <View style={styles.ctGrid}>
                        {classTests.map((ct) => {
                            const ctMarks = marks[ct.id] || [];
                            const completed = ctMarks.length > 0;
                            const avgMarks = completed ? calculateCTAverage(ct.id) : 0;

                            return (
                                <Card key={ct.id} style={styles.ctCard}>
                                    <View style={styles.ctHeader}>
                                        <Text style={styles.ctTitle}>{ct.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                            {completed && (
                                                <View style={[styles.ctBadge, { backgroundColor: colors.chart3 + '20' }]}>
                                                    <Ionicons name="checkmark" size={12} color={colors.chart3} />
                                                    <Text style={[styles.ctBadgeText, { color: colors.chart3 }]}>
                                                        Done
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={[styles.ctBadge, { backgroundColor: ct.isPublished ? colors.chart2 + '20' : colors.mutedForeground + '20' }]}>
                                                <Ionicons name={ct.isPublished ? 'eye' : 'eye-off'} size={12} color={ct.isPublished ? colors.chart2 : colors.mutedForeground} />
                                                <Text style={[styles.ctBadgeText, { color: ct.isPublished ? colors.chart2 : colors.mutedForeground }]}>
                                                    {ct.isPublished ? 'Visible' : 'Hidden'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {ct.description && (
                                        <Text style={styles.ctDescription}>{ct.description}</Text>
                                    )}

                                    <View style={styles.ctStats}>
                                        <View style={styles.ctStat}>
                                            <Text style={styles.ctStatLabel}>Total Marks</Text>
                                            <Text style={styles.ctStatValue}>{ct.totalMarks}</Text>
                                        </View>
                                        {completed && (
                                            <View style={styles.ctStat}>
                                                <Text style={styles.ctStatLabel}>Average</Text>
                                                <Text style={[styles.ctStatValue, { color: colors.chart2 }]}>
                                                    {avgMarks.toFixed(1)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                                        <Button
                                            onPress={() => onAddMarks(ct)}
                                            style={{ flex: 1 }}
                                        >
                                            <Ionicons name="create" size={18} color={colors.primaryForeground} />
                                            <Text style={{ color: colors.primaryForeground, marginLeft: 6 }}>
                                                {completed ? 'Edit Marks' : 'Add Marks'}
                                            </Text>
                                        </Button>
                                        <Button
                                            onPress={() => onPublishToggle(ct)}
                                            variant={ct.isPublished ? 'outline' : 'default'}
                                            style={{ paddingHorizontal: 16 }}
                                        >
                                            <Ionicons name={ct.isPublished ? 'eye-off' : 'eye'} size={18} color={ct.isPublished ? colors.foreground : colors.primaryForeground} />
                                        </Button>
                                    </View>
                                </Card>
                            );
                        })}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const getStyles = (colors: ColorScheme) => StyleSheet.create({
    tabContent: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.foreground,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginTop: 4,
    },
    ctGrid: {
        gap: 12,
    },
    ctCard: {
        padding: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ctHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ctTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
        flex: 1,
    },
    ctBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ctBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    ctDescription: {
        fontSize: 13,
        color: colors.mutedForeground,
        marginBottom: 12,
    },
    ctStats: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    ctStat: {
        flex: 1,
    },
    ctStatLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginBottom: 4,
    },
    ctStatValue: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.foreground,
    },
});
