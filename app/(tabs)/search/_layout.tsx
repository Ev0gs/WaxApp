import { Stack } from 'expo-router'
import { useSegments } from 'expo-router'
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

export default function SearchLayout() {
    return (
        <Stack
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="record/[id]"
                options={{
                    headerShown: false,
                    // Cache la tab bar sur cette page
                    presentation: 'card',
                }}
            />
        </Stack>
    )
}