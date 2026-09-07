import { useEffect } from 'react'
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from 'react-native'
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCollectionStore } from '@/stores/collectionStore'
import { theme } from '@/constants/theme'
import { VinylRecord } from '@/types'
import { useProfileStore } from '@/stores/profileStore'
import CollectionSkeleton from "@/components/ui/CollectionSkeleton";

const { width } = Dimensions.get('window')
const CARD_SIZE = (width - theme.spacing.md * 3) / 2

export default function CollectionScreen() {
    const insets = useSafeAreaInsets()
    const { records, isLoading, fetchRecords } = useCollectionStore()
    const { profile } = useProfileStore()

    useEffect(() => {
        fetchRecords()
    }, [])

    const totalArtists = new Set(records.map(r => r.artist)).size
    const topGenre = records
        .flatMap(r => r.genres)
        .reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1
            return acc
        }, {} as Record<string, number>)
    const topGenreLabel = Object.entries(topGenre).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    function renderCard({ item, index }: { item: VinylRecord, index: number }) {
        const rotation = index % 2 === 0 ? '1.5deg' : '-1.5deg'
        return (
            <TouchableOpacity
                style={[styles.card, { transform: [{ rotate: rotation }] }]}
                onPress={() => router.push(`/(tabs)/search/record/${item.discogs_id}?type=release`)}
                activeOpacity={0.85}
            >
                <Image
                    source={{ uri: item.cover_url }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardOverlay}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardArtist} numberOfLines={1}>{item.artist}</Text>
                    <Text style={styles.cardYear}>{item.year}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>WAX</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    {profile?.avatar_url ? (
                        <Image
                            source={{ uri: profile.avatar_url }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <Ionicons name="person-circle-outline" size={32} color={theme.colors.textMuted} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Hero */}
            <View style={styles.hero}>
                <Text style={styles.heroTitle}>My Crate</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{records.length} records</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statChip}>
                    <Ionicons name="disc-outline" size={14} color={theme.colors.accent} />
                    <Text style={styles.statText}>{records.length} records</Text>
                </View>
                <View style={styles.statChip}>
                    <Ionicons name="person-outline" size={14} color={theme.colors.accent} />
                    <Text style={styles.statText}>{totalArtists} artists</Text>
                </View>
                <View style={styles.statChip}>
                    <Ionicons name="musical-notes-outline" size={14} color={theme.colors.accent} />
                    <Text style={styles.statText}>{topGenreLabel}</Text>
                </View>
            </View>

            {/* Grid */}
            {isLoading ? (
                <CollectionSkeleton />
            ) : records.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="disc-outline" size={64} color={theme.colors.textMuted} />
                    <Text style={styles.emptyTitle}>Your crate is empty</Text>
                    <Text style={styles.emptySubtitle}>Search for records to add them</Text>
                </View>
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCard}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    { bottom: insets.bottom + 64 + 16 + 16 }
                ]}
                onPress={() => router.navigate('/(tabs)/search')}
            >
                <Ionicons name="add" size={28} color="#000" />
            </TouchableOpacity>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.accent,
        letterSpacing: 4,
    },
    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    badge: {
        backgroundColor: theme.colors.accent,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statText: {
        color: theme.colors.textPrimary,
        fontSize: 12,
        fontWeight: '500',
    },
    grid: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: 100,
    },
    row: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    cardTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
    },
    cardArtist: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
    },
    cardYear: {
        color: theme.colors.accent,
        fontSize: 10,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
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
    fab: {
        position: 'absolute',
        right: theme.spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    avatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
})