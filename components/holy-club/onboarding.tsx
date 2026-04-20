'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [nickname, setNickname] = useState('')
  const [wordGoal, setWordGoal] = useState(20)
  const [prayGoal, setPrayGoal] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  
  const setGoals = useStore((s) => s.setGoals)
  const setSetupDone = useStore((s) => s.setSetupDone)
  const setUser = useStore((s) => s.setUser)

  const handleStart = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요')
      return
    }

    setIsLoading(true)
    try {
      // Create user in database
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      const user = await response.json()
      
      setUser(user.id, user.nickname)
      setGoals({ word: wordGoal, pray: prayGoal })
      setSetupDone(true)
      onComplete()
    } catch (error) {
      console.error('Error creating user:', error)
      alert('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center px-8 pb-[calc(40px+env(safe-area-inset-bottom,0px))] pt-10 text-center">
      <div className="text-7xl mb-3">✝️</div>
      <h1 className="text-3xl font-extrabold text-accent m-0 mb-1.5">Holy Club</h1>
      <p className="text-muted-foreground m-0 mb-9 text-[15px] leading-relaxed">
        하나님과 더 가까워지는<br />매일의 경건 습관을 만들어요
      </p>
      
      <div className="w-full text-left mb-3">
        <label className="text-[13px] text-muted-foreground block mb-1.5">👤 닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력해주세요"
          maxLength={20}
          className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary bg-background"
        />
      </div>
      
      <div className="w-full text-left mb-3">
        <label className="text-[13px] text-muted-foreground block mb-1.5">📖 매일 말씀 묵상 목표 (분)</label>
        <input
          type="number"
          value={wordGoal}
          onChange={(e) => setWordGoal(parseInt(e.target.value) || 20)}
          min={5}
          max={120}
          className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary bg-background"
        />
      </div>
      
      <div className="w-full text-left mb-9">
        <label className="text-[13px] text-muted-foreground block mb-1.5">🙏 매일 기도 목표 (분)</label>
        <input
          type="number"
          value={prayGoal}
          onChange={(e) => setPrayGoal(parseInt(e.target.value) || 15)}
          min={5}
          max={120}
          className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary bg-background"
        />
      </div>
      
      <button
        onClick={handleStart}
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground border-none rounded-[14px] py-3.5 text-[15px] font-semibold cursor-pointer transition-all active:scale-[0.98] active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '생성 중...' : '시작하기 →'}
      </button>
      
      <p className="text-[11px] text-muted-foreground/50 mt-4">언제든지 설정에서 변경할 수 있어요</p>
    </div>
  )
}
