import { useState } from 'react'
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
    ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { theme } from '@/constants/theme'

export default function RegisterScreen() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    function validate() {
        if (!username.trim()) {
            setError('Please choose a username')
            return false
        }
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters')
            return false
        }
        if (!email.trim()) {
            setError('Please enter your email')
            return false
        }
        if (!password) {
            setError('Please enter a password')
            return false
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return false
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return false
        }
        return true
    }

    async function handleRegister() {
        setError(null)
        if (!validate()) return

        setLoading(true)

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username.trim(),
                    full_name: username.trim(),
                }
            }
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        // Sauvegarde le username dans la table profiles
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: username.trim(),
                })
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Text style={styles.logo}>WAX</Text>
                    <Text style={styles.successText}>
                        Check your email to confirm your account!
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Text style={styles.buttonText}>Back to login</Text>
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
                <ScrollView
                    contentContainerStyle={styles.inner}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.logo}>WAX</Text>
                        <Text style={styles.subtitle}>Create your account</Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor={theme.colors.textMuted}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
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
                        <TextInput
                            style={[
                                styles.input,
                                confirmPassword.length > 0 && password !== confirmPassword
                                    ? styles.inputError
                                    : null,
                                confirmPassword.length > 0 && password === confirmPassword
                                    ? styles.inputSuccess
                                    : null,
                            ]}
                            placeholder="Confirm password"
                            placeholderTextColor={theme.colors.textMuted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        {/* Indicateur de correspondance des mots de passe */}
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
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#000" />
                                : <Text style={styles.buttonText}>Create account</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.link}>
                            Already have an account?{' '}
                            <Text style={styles.linkAccent}>Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
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
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl,
        gap: 32,
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
    successText: {
        color: theme.colors.textPrimary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
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