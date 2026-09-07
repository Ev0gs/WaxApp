import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'
import { theme } from '@/constants/theme'

export default function StatsSkeleton() {
    return (
        <View style={styles.container}>
            {/* Titre */}
            <Skeleton width={120} height={32} borderRadius={6} style={{ marginBottom: theme.spacing.lg }} />

            {/* Hero card */}
            <Skeleton height={140} borderRadius={20} style={{ marginBottom: theme.spacing.md }} />

            {/* Chips */}
            <View style={styles.chipsRow}>
                <Skeleton width={'30%'} height={80} borderRadius={16} />
                <Skeleton width={'30%'} height={80} borderRadius={16} />
                <Skeleton width={'30%'} height={80} borderRadius={16} />
            </View>

            {/* Sections */}
            <Skeleton height={180} borderRadius={20} style={{ marginBottom: theme.spacing.md }} />
            <Skeleton height={180} borderRadius={20} style={{ marginBottom: theme.spacing.md }} />
            <Skeleton height={160} borderRadius={20} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
    },
    chipsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
})