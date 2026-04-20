'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ToastProvider } from './toast-provider'
import { BottomNav } from './bottom-nav'
import { Onboarding } from './onboarding'
import { HomeTab } from './home-tab'
import { WordTab } from './word-tab'
import { PrayerTab } from './prayer-tab'
import { MediaTab } from './media-tab'
import { GoalModal } from './goal-modal'

type Tab = 'home' | 'word' | 'prayer' | 'media'

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  const setupDone = useStore((s) => s.setupDone)

  useEffect(() => {
    setMounted(true)
    if (!setupDone) {
      setShowOnboarding(true)
    }
  }, [setupDone])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    window.scrollTo(0, 0)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-primary text-xl font-bold">Holy Club</div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <>
      <div className="pb-[72px]">
        {activeTab === 'home' && (
          <HomeTab onNavigate={handleTabChange} onOpenGoalModal={() => setShowGoalModal(true)} />
        )}
        {activeTab === 'word' && <WordTab />}
        {activeTab === 'prayer' && <PrayerTab />}
        {activeTab === 'media' && <MediaTab onOpenGoalModal={() => setShowGoalModal(true)} />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <GoalModal open={showGoalModal} onClose={() => setShowGoalModal(false)} />
    </>
  )
}

export function HolyClubApp() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
