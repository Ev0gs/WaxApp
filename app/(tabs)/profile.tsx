import { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    ActivityIndicator,
    Alert, TouchableWithoutFeedback, Keyboard, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { useProfileStore } from '@/stores/profileStore'
import { theme } from '@/constants/theme'
import * as FileSystem from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'
import ProfileSkeleton from "@/components/ui/ProfileSkeleton";
import Avatar from "@/components/ui/Avatar";

export default function ProfileScreen() {
    const { session } = useAuthStore()
    const { records } = useCollectionStore()
    const { profile, isLoading, fetchProfile, updateProfile } = useProfileStore()

    const [isEditing, setIsEditing] = useState(false)
    const [username, setUsername] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

    const email = session?.user?.email ?? ''
    const totalArtists = new Set(records.map(r => r.artist)).size
    const memberSince = session?.user?.created_at
        ? new Date(session.user.created_at).getFullYear()
        : '—'

    const displayName = profile?.username ?? email.split('@')[0]
    const initials = displayName.slice(0, 2).toUpperCase()

    useEffect(() => {
        fetchProfile()
    }, [])

    useEffect(() => {
        if (profile?.username) {
            setUsername(profile.username)
        }
    }, [profile])

    async function handleSave() {
        if (!username.trim()) return
        setIsSaving(true)
        const error = await updateProfile({ username: username.trim() })
        if (error) {
            Alert.alert('Error', error)
        } else {
            setIsEditing(false)
        }
        setIsSaving(false)
    }

    async function handlePickAvatar() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Please allow access to your photo library.')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (result.canceled) return

        setIsUploadingAvatar(true)

        try {
            const image = result.assets[0]
            const userId = session?.user?.id
            if (!userId) return

            const base64 = await FileSystem.readAsStringAsync(image.uri, {
                encoding: FileSystem.EncodingType.Base64,
            })

            const filePath = `${userId}/avatar.jpg`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true,
                })

            if (uploadError) {
                Alert.alert('Error', uploadError.message)
                return
            }

            // Récupère l'URL publique
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Met à jour le profil
            await updateProfile({ avatar_url: data.publicUrl })

        } catch (e) {
            Alert.alert('Error', 'Failed to upload avatar')
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut()
    }

    if (isLoading) return <ProfileSkeleton />

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                        <TouchableOpacity
                            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color={theme.colors.accent} size="small" />
                            ) : (
                                <Text style={styles.editButton}>
                                    {isEditing ? 'Save' : 'Edit'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={handlePickAvatar}
                            disabled={isUploadingAvatar}
                        >
                            {isUploadingAvatar ? (
                                <View style={[styles.avatarContainer, { width: 88, height: 88, borderRadius: 44 }]}>
                                    <ActivityIndicator color="#000" />
                                </View>
                            ) : (
                                <Avatar
                                    avatarUrl={profile?.avatar_url}
                                    username={profile?.username}
                                    email={email}
                                    size={88}
                                />
                            )}
                            <View style={styles.avatarEditBadge}>
                                <Ionicons name="camera" size={12} color="#000" />
                            </View>
                        </TouchableOpacity>

                        {/* Username / Email */}
                        {isEditing ? (
                            <View style={styles.usernameInputWrapper}>
                                <TextInput
                                    style={styles.usernameInput}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Choose a username"
                                    placeholderTextColor={theme.colors.textMuted}
                                    autoCapitalize="none"
                                    autoFocus
                                />
                            </View>
                        ) : (
                            <Text style={styles.displayName}>{displayName}</Text>
                        )}

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

                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => Linking.openSettings()}
                        >
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

                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => Linking.openSettings()}
                        >
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
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    avatarContainer: {
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    editButton: {
        color: theme.colors.accent,
        fontWeight: '600',
        fontSize: 16,
    },
    avatarSection: {
        alignItems: 'center',
        gap: 8,
        marginBottom: theme.spacing.lg,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 4,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000',
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
    usernameInputWrapper: {
        width: '60%',
    },
    usernameInput: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: theme.colors.accent,
    },
    displayName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    email: {
        fontSize: 14,
        color: theme.colors.textMuted,
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