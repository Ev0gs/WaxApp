import { useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { theme } from '@/constants/theme'
import { useState } from 'react'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin() {
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        setLoading(false)
    }

    async function handleGoogleLogin() {
        setGoogleLoading(true)
        setError(null)

        const redirectTo = makeRedirectUri({ scheme: 'wax' })

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                skipBrowserRedirect: true,
            },
        })

        if (error) {
            setError(error.message)
            setGoogleLoading(false)
            return
        }

        const result = await WebBrowser.openAuthSessionAsync(
            data.url ?? '',
            redirectTo
        )

        if (result.type === 'success') {
            const { url } = result
            const params = new URLSearchParams(url.split('#')[1])
            const accessToken = params.get('access_token')
            const refreshToken = params.get('refresh_token')

            if (accessToken && refreshToken) {
                await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })
            }
        }

        setGoogleLoading(false)
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.inner}>

                {/* Logo */}
                <View style={styles.header}>
                    <Text style={styles.logo}>WAX</Text>
                    <Text style={styles.subtitle}>Your vinyl library</Text>
                </View>

                {/* Formulaire */}
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={theme.colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={theme.colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {error && <Text style={styles.error}>{error}</Text>}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#000" />
                            : <Text style={styles.buttonText}>Sign in</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* Séparateur */}
                <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>or</Text>
                    <View style={styles.separatorLine} />
                </View>

                {/* Bouton Google */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    disabled={googleLoading}
                >
                    {googleLoading ? (
                        <ActivityIndicator color={theme.colors.textPrimary} />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={20} color={theme.colors.textPrimary} />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Lien register */}
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.link}>
                        No account yet?{' '}
                        <Text style={styles.linkAccent}>Create one</Text>
                    </Text>
                </TouchableOpacity>

            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        gap: 24,
    },
    header: {
        alignItems: 'center',
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
    },
    form: {
        gap: 12,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    button: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    buttonText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    error: {
        color: '#FF5555',
        fontSize: 13,
        textAlign: 'center',
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2A2A2A',
    },
    separatorText: {
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    googleButtonText: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
    link: {
        color: theme.colors.textMuted,
        textAlign: 'center',
        fontSize: 14,
    },
    linkAccent: {
        color: theme.colors.accent,
        fontWeight: '600',
    },
})