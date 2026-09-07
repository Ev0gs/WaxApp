import { useEffect } from 'react'
import { BackHandler } from 'react-native'
import { router } from 'expo-router'

export function useBackHandler() {
    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                // Si on peut revenir en arrière dans la stack
                if (router.canGoBack()) {
                    router.back()
                    return true // empêche le comportement par défaut (quitter l'app)
                }
                return false // laisse le comportement par défaut
            }
        )

        return () => subscription.remove()
    }, [])
}