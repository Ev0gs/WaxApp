import { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getRelease } from '@/lib/discogs'
import { useCollectionStore } from '@/stores/collectionStore'
import { theme } from '@/constants/theme'

const { width, height } = Dimensions.get('window')

export default function RecordDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [release, setRelease] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { records, addRecord, removeRecord } = useCollectionStore()

    const isInCollection = records.some(r => r.discogs_id === Number(id))

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            const data = await getRelease(Number(id))
            setRelease(data)
            setIsLoading(false)
        }
        load()
    }, [id])

    async function handleAdd() {
        if (!release) return
        await addRecord({
            user_id: '',
            discogs_id: release.id,
            title: release.title,
            artist: release.artists?.[0]?.name ?? '—',
            year: release.year,
            label: release.labels?.[0]?.name ?? '',
            country: release.country ?? '',
            cover_url: release.images?.[0]?.uri ?? '',
            genres: release.genres ?? [],
        })
    }

    async function handleRemove() {
        await removeRecord(Number(id))
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={theme.colors.accent} size="large" />
            </View>
        )
    }

    if (!release) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: theme.colors.textMuted }}>Record not found</Text>
            </View>
        )
    }

    const artist = release.artists?.[0]?.name ?? '—'
    const coverUrl = release.images?.[0]?.uri ?? ''
    const tracklist = release.tracklist?.filter((t: any) => t.type_ === 'track') ?? []
    const label = release.labels?.[0]?.name ?? '—'
    const chips = [
        release.year,
        label,
        release.country,
        release.formats?.[0]?.name,
        release.formats?.[0]?.descriptions?.[0],
    ].filter(Boolean)

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Cover image */}
                <View style={styles.coverContainer}>
                    {coverUrl ? (
                        <Image
                            source={{ uri: coverUrl }}
                            style={styles.cover}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.cover, styles.coverPlaceholder]}>
                            <Ionicons name="disc-outline" size={80} color={theme.colors.textMuted} />
                        </View>
                    )}
                    <LinearGradient
                        colors={['transparent', theme.colors.background]}
                        style={styles.coverGradient}
                    />
                </View>

                {/* Contenu */}
                <View style={styles.content}>

                    {/* Artist + Title */}
                    <Text style={styles.artist}>{artist.toUpperCase()}</Text>
                    <Text style={styles.title}>{release.title}</Text>

                    {/* Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipsScroll}
                        contentContainerStyle={styles.chips}
                    >
                        {chips.map((chip, i) => (
                            <View key={i} style={styles.chip}>
                                <Text style={styles.chipText}>{chip}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Tracklist */}
                    {tracklist.length > 0 && (
                        <View style={styles.tracklist}>
                            <Text style={styles.tracklistTitle}>Tracklist</Text>
                            {tracklist.map((track: any, index: number) => (
                                <View key={index} style={styles.trackRow}>
                                    <Text style={styles.trackPosition}>{track.position}</Text>
                                    <Text style={styles.trackTitle} numberOfLines={1}>
                                        {track.title}
                                    </Text>
                                    <Text style={styles.trackDuration}>{track.duration}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bouton retour */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            {/* CTA sticky */}
            <View style={styles.ctaContainer}>
                {isInCollection ? (
                    <View style={styles.ctaRow}>
                        <View style={styles.inCollectionBadge}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                            <Text style={styles.inCollectionText}>In your crate</Text>
                        </View>
                        <TouchableOpacity onPress={handleRemove}>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <Ionicons name="add" size={20} color="#000" />
                        <Text style={styles.addButtonText}>Add to my crate</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: 0,
    },
    coverContainer: {
        width: width,
        height: height * 0.45,
        position: 'relative',
    },
    cover: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    content: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.lg,
    },
    artist: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.textMuted,
        letterSpacing: 2,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        lineHeight: 34,
    },
    chipsScroll: {
        marginBottom: theme.spacing.lg,
    },
    chips: {
        gap: 8,
        paddingRight: theme.spacing.md,
    },
    chip: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    chipText: {
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    tracklist: {
        gap: 4,
    },
    tracklistTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
        gap: 12,
    },
    trackPosition: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.accent,
        width: 28,
    },
    trackTitle: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.textPrimary,
    },
    trackDuration: {
        fontSize: 13,
        color: theme.colors.textMuted,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: theme.spacing.md,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.md,
        paddingBottom: 34,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: '#1A1A1A',
    },
    addButton: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addButtonText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inCollectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inCollectionText: {
        color: theme.colors.success,
        fontWeight: '600',
        fontSize: 16,
    },
    removeText: {
        color: '#FF5555',
        fontSize: 14,
        fontWeight: '500',
    },
})