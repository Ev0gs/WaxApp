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
            // Si le profil n'a pas de données mais que Google en a fourni
            const googleName = user.user_metadata?.full_name ?? user.user_metadata?.name
            const googleAvatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture

            const needsUpdate =
                (!data.username && googleName) ||
                (!data.avatar_url && googleAvatar)

            if (needsUpdate) {
                const { data: updated } = await supabase
                    .from('profiles')
                    .update({
                        username: data.username ?? googleName,
                        avatar_url: data.avatar_url ?? googleAvatar,
                    })
                    .eq('id', user.id)
                    .select()
                    .single()

                set({ profile: updated })
            } else {
                set({ profile: data })
            }
        }

        set({ isLoading: false })
    },

    updateProfile: async (updates) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 'Not authenticated'

        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
            .select()
            .single()

        if (error) return error.message

        // Met à jour le store avec les données retournées par Supabase
        // plutôt qu'avec les updates locaux
        if (data) {
            set({ profile: data })
        }

        return null
    },
}))