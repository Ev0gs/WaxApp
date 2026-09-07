import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'
import { theme } from '@/constants/theme'

export default function ProfileSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Skeleton width={120} height={32} borderRadius={6} />
                <Skeleton width={40} height={20} borderRadius={6} />
            </View>

            {/* Avatar */}
            <View style={styles.avatarSection}>
                <Skeleton width={88} height={88} borderRadius={44} />
                <Skeleton width={120} height={22} borderRadius={6} />
                <Skeleton width={160} height={16} borderRadius={6} />
            </View>

            {/* Stats row */}
            <Skeleton
                height={88}
                borderRadius={20}
                style={{ marginBottom: theme.spacing.lg }}
            />

            {/* Settings */}
            <Skeleton
                height={140}
                borderRadius={20}
                style={{ marginBottom: theme.spacing.lg }}
            />

            {/* Sign out */}
            <Skeleton height={52} borderRadius={12} />
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
    avatarSection: {
        alignItems: 'center',
        gap: 10,
        marginBottom: theme.spacing.lg,
    },
})