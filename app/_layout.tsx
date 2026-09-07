import { useEffect } from 'react'
import { Slot, router } from 'expo-router'
import { Platform } from 'react-native'
import { NavigationBar } from 'expo-navigation-bar'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import LoadingScreen from '@/components/ui/SplashScreen'
import { useBackHandler } from '@/hooks/useBackHandler'

export default function RootLayout() {
    useBackHandler()

    const { setSession, setLoading, isLoading } = useAuthStore()

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {

            if (session) {
                const { data: { user }, error } = await supabase.auth.getUser()

                if (error || !user) {
                    await supabase.auth.signOut()
                    setSession(null)
                    setLoading(false)
                    router.replace('/(auth)/login')
                    return
                }
            }

            setSession(session)
            setLoading(false)
            router.replace(session ? '/(tabs)/collection' : '/(auth)/login')
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {

                // Redirige vers l'écran de reset password
                if (_event === 'PASSWORD_RECOVERY') {
                    router.replace('/reset-password')
                    return
                }

                // Ne pas rediriger sur ces événements — l'utilisateur reste où il est
                if (_event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
                    setSession(session)
                    return
                }

                if (session) {
                    const { data: { user }, error } = await supabase.auth.getUser()

                    if (error || !user) {
                        await supabase.auth.signOut()
                        setSession(null)
                        router.replace('/(auth)/login')
                        return
                    }
                }

                setSession(session)
                router.replace(session ? '/(tabs)/collection' : '/(auth)/login')
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Affiche le loading screen pendant la vérification
    if (isLoading) {
        return (
            <>
                {Platform.OS === 'android' && (
                    <NavigationBar hidden={false} style="light" />
                )}
                <LoadingScreen />
            </>
        )
    }

    return (
        <>
            {Platform.OS === 'android' && (
                <NavigationBar hidden={false} style="light" />
            )}
            <Slot />
        </>
    )
}