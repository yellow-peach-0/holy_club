'use client'

import { Home, Book, Heart, Tv } from 'lucide-react'

type Tab = 'home' | 'word' | 'prayer' | 'media'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'word', icon: Book, label: '말씀' },
    { id: 'prayer', icon: Heart, label: '기도' },
    { id: 'media', icon: Tv, label: '미디어' },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-secondary flex z-40 pb-[env(safe-area-inset-bottom,6px)] pt-1.5">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer py-1 border-none bg-transparent text-[10px] font-sans transition-colors ${
            activeTab === id ? 'text-primary' : 'text-[#C4B5FD]'
          }`}
        >
          <Icon className="w-[22px] h-[22px]" fill={activeTab === id ? 'currentColor' : 'none'} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
