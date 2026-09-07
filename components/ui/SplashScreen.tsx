import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { theme } from '@/constants/theme'

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>WAX</Text>
            <Text style={styles.subtitle}>Your vinyl library</Text>
            <ActivityIndicator
                color={theme.colors.accent}
                size="large"
                style={styles.loader}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    logo: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.accent,
        letterSpacing: 8,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        letterSpacing: 2,
        marginBottom: 16,
    },
    loader: {
        marginTop: 32,
    },
})