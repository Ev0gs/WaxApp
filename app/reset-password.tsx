import { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { theme } from '@/constants/theme'

export default function ResetPasswordScreen() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Récupère l'URL qui a ouvert l'app
        async function handleDeepLink() {
            const url = await Linking.getInitialURL()
            console.log('🔗 Deep link URL :', url)

            if (url) {
                await processUrl(url)
            }
        }

        // Écoute aussi les deep links si l'app était déjà ouverte
        const subscription = Linking.addEventListener('url', ({ url }) => {
            console.log('🔗 Deep link reçu :', url)
            processUrl(url)
        })

        handleDeepLink()

        return () => subscription.remove()
    }, [])

    async function processUrl(url: string) {
        try {
            // Extrait les paramètres du fragment (#) ou query (?)
            const params = url.includes('#')
                ? new URLSearchParams(url.split('#')[1])
                : new URLSearchParams(url.split('?')[1])

            const accessToken = params.get('access_token')
            const refreshToken = params.get('refresh_token')

            console.log('🔑 Access token trouvé :', accessToken ? 'OUI' : 'NON')

            if (accessToken && refreshToken) {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })

                if (error) {
                    console.log('❌ Erreur setSession :', error.message)
                    setError('Invalid or expired reset link. Please request a new one.')
                } else {
                    console.log('✅ Session établie')
                    setSessionReady(true)
                }
            } else {
                // Vérifie si une session existe déjà via PASSWORD_RECOVERY
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    console.log('✅ Session déjà présente')
                    setSessionReady(true)
                } else {
                    setError('Invalid or expired reset link. Please request a new one.')
                }
            }
        } catch (e) {
            console.log('❌ Erreur processUrl :', e)
            setError('Something went wrong. Please try again.')
        }
    }

    async function handleResetPassword() {
        if (!password) {
            setError('Please enter a new password')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            setTimeout(() => router.replace('/(auth)/login'), 2000)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Text style={styles.logo}>WAX</Text>
                    <Text style={styles.successTitle}>Password updated!</Text>
                    <Text style={styles.successText}>Redirecting you to login...</Text>
                </View>
            </View>
        )
    }

    // Session pas encore établie
    if (!sessionReady && !error) {
        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Text style={styles.logo}>WAX</Text>
                    <ActivityIndicator color={theme.colors.accent} size="large" />
                    <Text style={styles.loadingText}>Verifying your reset link...</Text>
                </View>
            </View>
        )
    }

    // Lien invalide ou expiré
    if (error && !sessionReady) {
        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Text style={styles.logo}>WAX</Text>
                    <Text style={styles.errorTitle}>Link expired</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace('/(auth)/forgot-password')}
                    >
                        <Text style={styles.buttonText}>Request new link</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>WAX</Text>
                        <Text style={styles.subtitle}>New password</Text>
                        <Text style={styles.description}>
                            Choose a strong password for your account.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="New password"
                            placeholderTextColor={theme.colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoFocus
                        />
                        <TextInput
                            style={[
                                styles.input,
                                confirmPassword.length > 0 && password !== confirmPassword
                                    ? styles.inputError : null,
                                confirmPassword.length > 0 && password === confirmPassword
                                    ? styles.inputSuccess : null,
                            ]}
                            placeholder="Confirm new password"
                            placeholderTextColor={theme.colors.textMuted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        {confirmPassword.length > 0 && (
                            <Text style={[
                                styles.passwordHint,
                                password === confirmPassword
                                    ? styles.passwordHintSuccess
                                    : styles.passwordHintError
                            ]}>
                                {password === confirmPassword
                                    ? '✓ Passwords match'
                                    : '✗ Passwords do not match'
                                }
                            </Text>
                        )}

                        {error && <Text style={styles.error}>{error}</Text>}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#000" />
                                : <Text style={styles.buttonText}>Update password</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
        gap: 32,
        alignItems: 'center',
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
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginTop: 8,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    form: {
        width: '100%',
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
    inputError: {
        borderColor: '#FF5555',
    },
    inputSuccess: {
        borderColor: theme.colors.success,
    },
    passwordHint: {
        fontSize: 13,
        marginTop: -4,
    },
    passwordHintSuccess: {
        color: theme.colors.success,
    },
    passwordHintError: {
        color: '#FF5555',
    },
    button: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        width: '100%',
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
    errorTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    errorText: {
        color: theme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
    },
    successText: {
        fontSize: 15,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    loadingText: {
        color: theme.colors.textMuted,
        fontSize: 14,
        marginTop: 16,
    },
})