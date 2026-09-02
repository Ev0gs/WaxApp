import { create } from 'zustand'
import { VinylRecord } from '@/types'
import { supabase } from '@/lib/supabase'

type CollectionStore = {
    records: VinylRecord[]
    isLoading: boolean
    fetchRecords: () => Promise<void>
    addRecord: (record: Omit<VinylRecord, 'id' | 'added_at'>) => Promise<void>
    removeRecord: (discogsId: number) => Promise<void>
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
    records: [],
    isLoading: false,

    fetchRecords: async () => {
        set({ isLoading: true })

        const { data, error } = await supabase
            .from('records')
            .select('*')
            .order('added_at', { ascending: false })

        if (!error && data) {
            set({ records: data })
        }

        set({ isLoading: false })
    },

    addRecord: async (record) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('records')
            .insert({ ...record, user_id: user.id })
            .select()
            .single()

        if (!error && data) {
            set({ records: [data, ...get().records] })
        }
    },

    removeRecord: async (discogsId) => {
        const { error } = await supabase
            .from('records')
            .delete()
            .eq('discogs_id', discogsId)

        if (!error) {
            set({
                records: get().records.filter(r => r.discogs_id !== discogsId)
            })
        }
    },
}))