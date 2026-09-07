import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { theme } from '@/constants/theme'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.replace('/(tabs)/collection')
            } else {
                router.replace('/(auth)/login')
            }
        })
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
    )
}