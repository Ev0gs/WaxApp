import { Tabs, useSegments } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { BlurView } from 'expo-blur'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
    const insets = useSafeAreaInsets()
    const segments = useSegments()

    const isRecordDetail = segments.includes('record')

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.accent,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarShowLabel: true,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: insets.bottom + 16,
                    left: 16,
                    right: 16,
                    borderRadius: 24,
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 64,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                },
                tabBarItemStyle: {
                    height: 64,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 4,
                },
                tabBarIconStyle: {
                    marginTop: 0,
                    marginBottom: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    letterSpacing: 0.5,
                    marginTop: 2,
                    marginBottom: 0,
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={80}
                        tint="dark"
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                borderRadius: 24,
                                overflow: 'hidden',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.08)',
                            }
                        ]}
                    />
                ),
            }}
        >
            <Tabs.Screen
                name="collection"
                options={{
                    title: 'Collection',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bar-chart-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}