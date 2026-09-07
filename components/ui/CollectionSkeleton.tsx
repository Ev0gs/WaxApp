import { View, StyleSheet, Dimensions } from 'react-native'
import Skeleton from './Skeleton'
import { theme } from '@/constants/theme'

const { width } = Dimensions.get('window')
const CARD_SIZE = (width - theme.spacing.md * 3) / 2

export default function CollectionSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Skeleton width={80} height={28} borderRadius={6} />
                <Skeleton width={32} height={32} borderRadius={16} />
            </View>

            {/* Hero */}
            <View style={styles.hero}>
                <Skeleton width={120} height={36} borderRadius={8} />
                <Skeleton width={90} height={24} borderRadius={12} />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <Skeleton width={100} height={32} borderRadius={16} />
                <Skeleton width={100} height={32} borderRadius={16} />
                <Skeleton width={100} height={32} borderRadius={16} />
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {[...Array(6)].map((_, i) => (
                    <Skeleton
                        key={i}
                        width={CARD_SIZE}
                        height={CARD_SIZE}
                        borderRadius={12}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: theme.spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: theme.spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
})