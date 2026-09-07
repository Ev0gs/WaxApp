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
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { theme } from '@/constants/theme'

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleResetPassword() {
        if (!email.trim()) {
            setError('Please enter your email')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'wax://reset-password',
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <Text style={styles.logo}>WAX</Text>
                    <Ionicons name="mail-outline" size={64} color={theme.colors.accent} />
                    <Text style={styles.successTitle}>Check your inbox!</Text>
                    <Text style={styles.successText}>
                        We sent a password reset link to{'\n'}
                        <Text style={styles.successEmail}>{email}</Text>
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
                <View style={styles.inner}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>WAX</Text>
                        <Text style={styles.subtitle}>Reset your password</Text>
                        <Text style={styles.description}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={theme.colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoFocus
                        />

                        {error && <Text style={styles.error}>{error}</Text>}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#000" />
                                : <Text style={styles.buttonText}>Send reset link</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Back to login */}
                    <TouchableOpacity
                        style={styles.backRow}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={16} color={theme.colors.textMuted} />
                        <Text style={styles.backText}>Back to login</Text>
                    </TouchableOpacity>

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
        marginTop: 4,
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
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        marginTop: 16,
    },
    successText: {
        fontSize: 15,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    successEmail: {
        color: theme.colors.accent,
        fontWeight: '600',
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backText: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
})