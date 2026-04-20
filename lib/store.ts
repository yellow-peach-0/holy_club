'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PrayerNote {
  id: string
  title: string
  body: string
  date: string
  answered: boolean
}

export interface AppState {
  // User info for DB sync
  userId: string | null
  nickname: string
  
  setupDone: boolean
  streak: {
    count: number
    lastDate: string
    graceUsed: boolean
    graceDate: string
  }
  bibleRead: Record<string, boolean>
  wordTime: Record<string, number>
  prayTime: Record<string, number>
  prayNotes: PrayerNote[]
  media: Record<string, Record<string, number>>
  goals: {
    word: number
    pray: number
    media: number
  }
  
  // Actions
  setUser: (userId: string, nickname: string) => void
  setSetupDone: (done: boolean) => void
  setGoals: (goals: { word: number; pray: number; media?: number }) => void
  addWordTime: (date: string, seconds: number) => void
  addPrayTime: (date: string, seconds: number) => void
  toggleBibleChapter: (bookIdx: number, chapter: number) => void
  addPrayerNote: (note: Omit<PrayerNote, 'id'>) => void
  togglePrayerNote: (id: string) => void
  deletePrayerNote: (id: string) => void
  setMediaTime: (date: string, platform: string, minutes: number) => void
  updateStreak: (date: string, hasActivity: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: null,
      nickname: '',
      setupDone: false,
      streak: { count: 0, lastDate: '', graceUsed: false, graceDate: '' },
      bibleRead: {},
      wordTime: {},
      prayTime: {},
      prayNotes: [],
      media: {},
      goals: { word: 20, pray: 15, media: 90 },

      setUser: (userId, nickname) => set({ userId, nickname }),
      setSetupDone: (done) => set({ setupDone: done }),
      
      setGoals: (goals) => set((state) => ({
        goals: { ...state.goals, ...goals }
      })),

      addWordTime: (date, seconds) => set((state) => ({
        wordTime: {
          ...state.wordTime,
          [date]: (state.wordTime[date] || 0) + seconds
        }
      })),

      addPrayTime: (date, seconds) => set((state) => ({
        prayTime: {
          ...state.prayTime,
          [date]: (state.prayTime[date] || 0) + seconds
        }
      })),

      toggleBibleChapter: (bookIdx, chapter) => set((state) => {
        const key = `${bookIdx}-${chapter}`
        const newBibleRead = { ...state.bibleRead }
        if (newBibleRead[key]) {
          delete newBibleRead[key]
        } else {
          newBibleRead[key] = true
        }
        return { bibleRead: newBibleRead }
      }),

      addPrayerNote: (note) => set((state) => ({
        prayNotes: [...state.prayNotes, { ...note, id: Date.now().toString() }]
      })),

      togglePrayerNote: (id) => set((state) => ({
        prayNotes: state.prayNotes.map(n => 
          n.id === id ? { ...n, answered: !n.answered } : n
        )
      })),

      deletePrayerNote: (id) => set((state) => ({
        prayNotes: state.prayNotes.filter(n => n.id !== id)
      })),

      setMediaTime: (date, platform, minutes) => set((state) => ({
        media: {
          ...state.media,
          [date]: {
            ...(state.media[date] || {}),
            [platform]: Math.max(0, minutes)
          }
        }
      })),

      updateStreak: (date, hasActivity) => set((state) => {
        if (!hasActivity || state.streak.lastDate === date) return state
        
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const { count, lastDate, graceDate } = state.streak
        
        let newCount: number
        if (lastDate === yesterday || lastDate === '') {
          newCount = (lastDate === yesterday ? count : 0) + 1
        } else if (graceDate === yesterday && count > 0) {
          newCount = count + 1
        } else {
          newCount = 1
        }
        
        return {
          streak: {
            ...state.streak,
            count: newCount,
            lastDate: date
          }
        }
      }),
    }),
    {
      name: 'holyclub_v2',
    }
  )
)

// Helper functions
export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatMinutes = (seconds: number) => {
  const m = Math.round(seconds / 60)
  return m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`
}

export const getTodayKey = () => new Date().toISOString().slice(0, 10)

// Sync to database helper
export async function syncToDatabase(state: AppState) {
  if (!state.userId) return

  const today = getTodayKey()
  const todayMedia = state.media[today] || {}
  const totalMedia = Object.values(todayMedia).reduce((a, b) => a + b, 0)

  try {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: state.userId,
        date: today,
        bible_chapters: Object.keys(state.bibleRead).length,
        prayer_minutes: Math.round((state.prayTime[today] || 0) / 60),
        media_minutes: totalMedia,
        prayer_notes: state.prayNotes,
        bible_read: state.bibleRead,
        media_usage: todayMedia,
      }),
    })
  } catch (error) {
    console.error('Failed to sync:', error)
  }
}
