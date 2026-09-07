import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { theme } from '@/constants/theme'

export default function RegisterScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleRegister() {
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({ email, password })

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
                <View style={styles.inner}>

                    <View style={styles.header}>
                        <Text style={styles.logo}>WAX</Text>
                        <Text style={styles.subtitle}>Create your account</Text>
                    </View>

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