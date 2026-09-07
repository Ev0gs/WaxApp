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
            console.log('🔍 Session trouvée :', session ? 'OUI' : 'NON')

            if (session) {
                console.log('👤 Vérification de l utilisateur côté serveur...')
                const { data: { user }, error } = await supabase.auth.getUser()

                console.log('✅ User retourné par Supabase :', user ? user.id : 'NULL')
                console.log('❌ Erreur retournée :', error ? error.message : 'AUCUNE')

                if (error || !user) {
                    console.log('🚫 Utilisateur invalide → déconnexion forcée')
                    await supabase.auth.signOut()
                    setSession(null)
                    setLoading(false)
                    router.replace('/(auth)/login')
                    return
                }

                console.log('🎉 Utilisateur valide → redirection collection')
            }

            setSession(session)
            setLoading(false)
            router.replace(session ? '/(tabs)/collection' : '/(auth)/login')
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('🔄 Auth state changed :', _event)
                console.log('🔍 Session :', session ? 'OUI' : 'NON')

                // Ne pas rediriger sur ces événements — l'utilisateur reste où il est
                if (_event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
                    console.log('🔁 Token rafraîchi ou user mis à jour → pas de redirection')
                    setSession(session)
                    return
                }

                if (session) {
                    const { data: { user }, error } = await supabase.auth.getUser()

                    console.log('✅ User :', user ? user.id : 'NULL')
                    console.log('❌ Erreur :', error ? error.message : 'AUCUNE')

                    if (error || !user) {
                        console.log('🚫 Session invalide → déconnexion forcée')
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