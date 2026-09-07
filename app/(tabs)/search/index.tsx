import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator, TouchableWithoutFeedback, Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { searchVinyl } from '@/lib/discogs'
import { useCollectionStore } from '@/stores/collectionStore'
import { theme } from '@/constants/theme'
import { DiscogsSearchResult } from '@/types'
import BarcodeScanner from '@/components/scanner/BarcodeScanner'
import {router} from "expo-router";

export default function SearchScreen() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<DiscogsSearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'search' | 'scan'>('search')
    const { records, addRecord } = useCollectionStore()

    async function handleSearch(searchQuery?: string) {
        const q = searchQuery ?? query
        if (!q.trim()) return
        setIsLoading(true)
        const data = await searchVinyl(q)
        setResults(data)
        setIsLoading(false)
    }

    function isInCollection(discogsId: number) {
        return records.some(r => r.discogs_id === discogsId)
    }

    async function handleAdd(item: DiscogsSearchResult) {
        const artist = item.title.split(' - ')[0] ?? item.title
        const title = item.title.split(' - ')[1] ?? item.title

        await addRecord({
            user_id: '',
            discogs_id: item.id,
            title,
            artist,
            year: item.year,
            label: item.label?.[0] ?? '',
            country: item.country ?? '',
            cover_url: item.cover_image ?? item.thumb ?? '',
            genres: item.genre ?? [],
        })
    }

    function renderResult({ item }: { item: DiscogsSearchResult }) {
        const inCollection = isInCollection(item.id)
        const artist = item.title.split(' - ')[0]
        const title = item.title.split(' - ')[1] ?? item.title

        return (
            <TouchableOpacity
                style={styles.resultCard}
                onPress={() => router.push(`/(tabs)/search/record/${item.id}`)}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: item.thumb }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.resultArtist} numberOfLines={1}>{artist}</Text>
                    <View style={styles.resultMeta}>
                        <Text style={styles.resultYear}>{item.year}</Text>
                        {item.format?.[0] && (
                            <View style={styles.formatBadge}>
                                <Text style={styles.formatText}>{item.format[0]}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, inCollection && styles.addButtonDisabled]}
                    onPress={(e) => {
                        e.stopPropagation()
                        !inCollection && handleAdd(item)
                    }}
                    disabled={inCollection}
                >
                    <Ionicons
                        name={inCollection ? 'checkmark' : 'add'}
                        size={20}
                        color={inCollection ? theme.colors.success : '#000'}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Search</Text>
                </View>

                {/* Search bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="Artist, album, label..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch()}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setActiveTab(activeTab === 'scan' ? 'search' : 'scan')}>
                        <Ionicons
                            name="barcode-outline"
                            size={24}
                            color={activeTab === 'scan' ? theme.colors.accent : theme.colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'search' && styles.tabActive]}
                        onPress={() => setActiveTab('search')}
                    >
                        <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
                            By title / artist
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'scan' && styles.tabActive]}
                        onPress={() => setActiveTab('scan')}
                    >
                        <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>
                            Scan barcode
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Contenu selon l'onglet actif */}
                {activeTab === 'scan' ? (
                    <BarcodeScanner
                        onScanned={(barcode) => {
                            setActiveTab('search')
                            setQuery(barcode)
                            handleSearch(barcode)
                        }}
                    />
                ) : isLoading ? (
                    <ActivityIndicator
                        color={theme.colors.accent}
                        size="large"
                        style={{ marginTop: 60 }}
                    />
                ) : results.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="disc-outline" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>Search for a record</Text>
                        <Text style={styles.emptySubtitle}>to add it to your crate</Text>
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderResult}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}

            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        marginHorizontal: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 10,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    input: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: 16,
    },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    tabActive: {
        backgroundColor: theme.colors.accent,
    },
    tabText: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#000',
    },
    list: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: 100,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: '#2A2A2A',
    },
    resultInfo: {
        flex: 1,
        gap: 2,
    },
    resultTitle: {
        color: theme.colors.textPrimary,
        fontWeight: '700',
        fontSize: 14,
    },
    resultArtist: {
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    resultYear: {
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    formatBadge: {
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    formatText: {
        color: theme.colors.textMuted,
        fontSize: 11,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonDisabled: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.success,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyTitle: {
        color: theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    emptySubtitle: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
})