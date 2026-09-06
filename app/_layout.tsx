import { useEffect } from 'react'
import { NavigationBar } from 'expo-navigation-bar'
import { Slot, router } from 'expo-router'
import {useAuthStore} from "@/stores/authStore";
import {supabase} from "@/lib/supabase";
import {Platform} from "react-native";

export default function RootLayout() {
    const { setSession, setLoading } = useAuthStore()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
            router.replace(session ? '/(tabs)/collection' : '/(auth)/login')
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                router.replace(session ? '/(tabs)/collection' : '/(auth)/login')
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return (
        <>
            {Platform.OS === 'android' && (
                <NavigationBar hidden={true} style="dark" />
            )}
            <Slot />
        </>
    )
}