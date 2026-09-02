import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type Profile = {
    id: string
    username: string | null
    avatar_url: string | null
}

type ProfileStore = {
    profile: Profile | null
    isLoading: boolean
    fetchProfile: () => Promise<void>
    updateProfile: (updates: Partial<Pick<Profile, 'username' | 'avatar_url'>>) => Promise<string | null>
}

export const useProfileStore = create<ProfileStore>((set) => ({
    profile: null,
    isLoading: false,

    fetchProfile: async () => {
        set({ isLoading: true })

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!error && data) {
            set({ profile: data })
        }

        set({ isLoading: false })
    },

    updateProfile: async (updates) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 'Not authenticated'

        const { error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

        if (error) return error.message

        set(state => ({
            profile: state.profile ? { ...state.profile, ...updates } : null
        }))

        return null
    },
}))