import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { theme } from '@/constants/theme'

export default function ProfileScreen() {
    const { session } = useAuthStore()
    const { records } = useCollectionStore()

    const email = session?.user?.email ?? ''
    const initials = email.slice(0, 2).toUpperCase()
    const totalArtists = new Set(records.map(r => r.artist)).size
    const memberSince = session?.user?.created_at
        ? new Date(session.user.created_at).getFullYear()
        : '—'

    async function handleSignOut() {
        await supabase.auth.signOut()
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.title}>Profile</Text>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.email}>{email}</Text>
                    <Text style={styles.memberSince}>Member since {memberSince}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{records.length}</Text>
                        <Text style={styles.statLabel}>Records</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalArtists}</Text>
                        <Text style={styles.statLabel}>Artists</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{memberSince}</Text>
                        <Text style={styles.statLabel}>Since</Text>
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity style={styles.settingRow}>
                        <Ionicons
                            name="notifications-outline"
                            size={20}
                            color={theme.colors.textMuted}
                        />
                        <Text style={styles.settingLabel}>Notifications</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.textMuted}
                        />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingRow}>
                        <Ionicons
                            name="moon-outline"
                            size={20}
                            color={theme.colors.textMuted}
                        />
                        <Text style={styles.settingLabel}>Dark mode</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.textMuted}
                        />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingRow}>
                        <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color={theme.colors.textMuted}
                        />
                        <Text style={styles.settingLabel}>About</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                {/* Sign out */}
                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF5555" />
                    <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>

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
    avatarSection: {
        alignItems: 'center',
        gap: 8,
        marginBottom: theme.spacing.lg,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000',
    },
    email: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    memberSince: {
        fontSize: 13,
        color: theme.colors.textMuted,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#2A2A2A',
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: theme.spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    settingLabel: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: 15,
    },
    separator: {
        height: 1,
        backgroundColor: '#2A2A2A',
        marginVertical: theme.spacing.sm,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#FF5555',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    signOutText: {
        color: '#FF5555',
        fontWeight: '700',
        fontSize: 16,
    },
})