import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCollectionStore } from '@/stores/collectionStore'
import { theme } from '@/constants/theme'

export default function StatsScreen() {
    const { records } = useCollectionStore()

    // Calculs des stats
    const totalRecords = records.length
    const totalArtists = new Set(records.map(r => r.artist)).size

    const genreCounts = records
        .flatMap(r => r.genres)
        .reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1
            return acc
        }, {} as Record<string, number>)

    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    const decadeCounts = records.reduce((acc, r) => {
        if (!r.year) return acc
        const decade = `${Math.floor(r.year / 10) * 10}s`
        acc[decade] = (acc[decade] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const sortedDecades = Object.entries(decadeCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))

    const topArtists = Object.entries(
        records.reduce((acc, r) => {
            acc[r.artist] = (acc[r.artist] || 0) + 1
            return acc
        }, {} as Record<string, number>)
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    const maxGenreCount = sortedGenres[0]?.[1] ?? 1
    const maxDecadeCount = Math.max(...Object.values(decadeCounts), 1)

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.title}>My Stats</Text>

                {/* Total records */}
                <View style={styles.heroCard}>
                    <Ionicons name="disc" size={32} color={theme.colors.accent} />
                    <Text style={styles.heroNumber}>{totalRecords}</Text>
                    <Text style={styles.heroLabel}>records in your crate</Text>
                </View>

                {/* Chips résumé */}
                <View style={styles.chipsRow}>
                    <View style={styles.chip}>
                        <Ionicons name="person-outline" size={16} color={theme.colors.accent} />
                        <Text style={styles.chipNumber}>{totalArtists}</Text>
                        <Text style={styles.chipLabel}>artists</Text>
                    </View>
                    <View style={styles.chip}>
                        <Ionicons name="musical-notes-outline" size={16} color={theme.colors.accent} />
                        <Text style={styles.chipNumber}>{sortedGenres.length}</Text>
                        <Text style={styles.chipLabel}>genres</Text>
                    </View>
                    <View style={styles.chip}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
                        <Text style={styles.chipNumber}>{sortedDecades.length}</Text>
                        <Text style={styles.chipLabel}>decades</Text>
                    </View>
                </View>

                {/* Genres */}
                {sortedGenres.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Genres</Text>
                        {sortedGenres.map(([genre, count]) => (
                            <View key={genre} style={styles.barRow}>
                                <Text style={styles.barLabel}>{genre}</Text>
                                <View style={styles.barTrack}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            { width: `${(count / maxGenreCount) * 100}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barCount}>{count}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Décennies */}
                {sortedDecades.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>By Decade</Text>
                        {sortedDecades.map(([decade, count]) => (
                            <View key={decade} style={styles.barRow}>
                                <Text style={styles.barLabel}>{decade}</Text>
                                <View style={styles.barTrack}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            { width: `${(count / maxDecadeCount) * 100}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barCount}>{count}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Top artistes */}
                {topArtists.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Artists</Text>
                        {topArtists.map(([artist, count], index) => (
                            <View key={artist} style={styles.artistRow}>
                                <Text style={styles.artistRank}>#{index + 1}</Text>
                                <Text style={styles.artistName} numberOfLines={1}>{artist}</Text>
                                <View style={styles.artistBadge}>
                                    <Text style={styles.artistCount}>{count}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty state */}
                {totalRecords === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="bar-chart-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>No stats yet</Text>
                        <Text style={styles.emptySubtitle}>Add records to see your stats</Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    heroCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        gap: 8,
        marginBottom: theme.spacing.md,
    },
    heroNumber: {
        fontSize: 64,
        fontWeight: '900',
        color: theme.colors.textPrimary,
        lineHeight: 72,
    },
    heroLabel: {
        fontSize: 14,
        color: theme.colors.textMuted,
        letterSpacing: 1,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    chip: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    chipNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    chipLabel: {
        fontSize: 11,
        color: theme.colors.textMuted,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    barLabel: {
        color: theme.colors.textMuted,
        fontSize: 13,
        width: 80,
    },
    barTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: theme.colors.accent,
        borderRadius: 4,
    },
    barCount: {
        color: theme.colors.textPrimary,
        fontSize: 13,
        fontWeight: '600',
        width: 24,
        textAlign: 'right',
    },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    artistRank: {
        color: theme.colors.accent,
        fontWeight: '700',
        fontSize: 13,
        width: 28,
    },
    artistName: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    artistBadge: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    artistCount: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingTop: 60,
    },
    emptyTitle: {
        color: theme.colors.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    emptySubtitle: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
})