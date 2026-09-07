import { View, Text, Image, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

type Props = {
    avatarUrl?: string | null
    username?: string | null
    email?: string | null
    size?: number
}

export default function Avatar({ avatarUrl, username, email, size = 32 }: Props) {
    const displayName = username ?? email?.split('@')[0] ?? '?'
    const initials = displayName.slice(0, 2).toUpperCase()
    const fontSize = size * 0.35

    if (avatarUrl) {
        return (
            <Image
                source={{ uri: avatarUrl }}
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            />
        )
    }

    return (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: theme.colors.surface,
    },
    placeholder: {
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: '#000',
        fontWeight: '800',
    },
})