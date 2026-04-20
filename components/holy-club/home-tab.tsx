'use client'

import { useState, useEffect } from 'react'
import { useStore, getTodayKey, syncToDatabase } from '@/lib/store'
import { TOTAL_CHAPTERS } from '@/lib/constants'
import { VerseCard } from './verse-card'
import { WeeklyChart } from './weekly-chart'

interface HomeTabProps {
  onNavigate: (tab: 'word' | 'prayer' | 'media') => void
  onOpenGoalModal: () => void
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export function HomeTab({ onNavigate, onOpenGoalModal }: HomeTabProps) {
  const [showShareToast, setShowShareToast] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const today = getTodayKey()
  const userId = useStore((s) => s.userId)
  const nickname = useStore((s) => s.nickname)
  const wordTime = useStore((s) => s.wordTime)
  const prayTime = useStore((s) => s.prayTime)
  const media = useStore((s) => s.media)
  const bibleRead = useStore((s) => s.bibleRead)
  const goals = useStore((s) => s.goals)
  const streak = useStore((s) => s.streak)

  // Auto sync to database every minute and on changes
  useEffect(() => {
    if (!userId) return

    const state = useStore.getState()
    syncToDatabase(state)

    const interval = setInterval(() => {
      const state = useStore.getState()
      syncToDatabase(state)
    }, 60000)

    return () => clearInterval(interval)
  }, [userId, wordTime[today], prayTime[today], media[today], bibleRead])

  const handleShare = async () => {
    if (!userId) return

    const shareUrl = `${window.location.origin}/u/${userId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${nickname}님의 경건 기록`,
          text: 'Holy Club에서 함께 경건 생활을 해요!',
          url: shareUrl,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    }
  }

  const handleManualSync = async () => {
    if (!userId || isSyncing) return
    setIsSyncing(true)
    const state = useStore.getState()
    await syncToDatabase(state)
    setIsSyncing(false)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 2000)
  }

  const d = new Date()
  const dateStr = `${d.getFullYear()}년 ${MONTHS[d.getMonth()]}월 ${d.getDate()}일 (${DAYS[d.getDay()]})`
  const h = d.getHours()
  const greet = h < 5 ? '새벽에 깨어 기도하시는군요' : h < 12 ? '좋은 아침이에요' : h < 18 ? '안녕하세요' : '좋은 저녁이에요'

  const wordSeconds = wordTime[today] || 0
  const wordMin = Math.round(wordSeconds / 60)
  const wordPct = Math.min(100, Math.round((wordSeconds / (goals.word * 60)) * 100))

  const praySeconds = prayTime[today] || 0
  const prayMin = Math.round(praySeconds / 60)
  const prayPct = Math.min(100, Math.round((praySeconds / (goals.pray * 60)) * 100))

  const mediaData = media[today] || {}
  const mediaMin = Object.values(mediaData).reduce((a: number, v) => a + (v as number), 0)
  const godlyMin = wordMin + prayMin

  const readCount = Object.values(bibleRead).filter(Boolean).length
  const biblePct = Math.round((readCount / TOTAL_CHAPTERS) * 100)

  const mediaMsg =
    mediaMin === 0 && godlyMin === 0
      ? '아직 기록이 없어요. 오늘도 화이팅!'
      : mediaMin === 0
        ? '미디어 없음! 완벽해요'
        : godlyMin === 0
          ? '말씀/기도를 시작해보세요 📖'
          : godlyMin >= mediaMin
            ? `경건 시간이 미디어보다 ${godlyMin - mediaMin}분 많아요`
            : `미디어가 ${mediaMin - godlyMin}분 더 많아요`

  return (
    <div className="px-4 pb-6">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-card text-card-foreground px-4 py-2 rounded-xl shadow-lg z-50 text-sm">
          {isSyncing ? '동기화 완료!' : '링크가 복사되었어요!'}
        </div>
      )}

      {/* Header */}
      <div className="py-4 flex items-center justify-between">
        <div>
          <p className="m-0 text-[12px] text-muted-foreground">{dateStr}</p>
          <h1 className="m-0 mt-1 text-xl font-bold text-accent">
            {nickname ? `${nickname}님, ` : ''}{greet} 🙏
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-lg"
            title="공유하기"
          >
            🔗
          </button>
          <div className="text-right cursor-pointer" onClick={onOpenGoalModal}>
            <div className="text-[28px] font-extrabold text-primary">
              {streak.count > 0 ? (
                <>
                  <span className="fire-anim">🔥</span> {streak.count}일
                </>
              ) : (
                <>
                  <span className="text-[22px]">💤</span> 0일
                </>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">연속 일수</div>
          </div>
        </div>
      </div>

      <div className="px-0">
        <VerseCard />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div
            className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] cursor-pointer"
            onClick={() => onNavigate('word')}
          >
            <div className="text-[11px] text-muted-foreground mb-1">📖 말씀 묵상</div>
            <div className="text-2xl font-bold text-accent">{wordMin}분</div>
            <div className="text-[11px] text-primary mt-0.5">목표 {wordPct}%</div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#A855F7] rounded-full transition-all duration-500"
                style={{ width: `${wordPct}%` }}
              />
            </div>
          </div>
          <div
            className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] cursor-pointer"
            onClick={() => onNavigate('prayer')}
          >
            <div className="text-[11px] text-muted-foreground mb-1">🙏 기도</div>
            <div className="text-2xl font-bold text-accent">{prayMin}분</div>
            <div className="text-[11px] text-primary mt-0.5">목표 {prayPct}%</div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#A855F7] rounded-full transition-all duration-500"
                style={{ width: `${prayPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Media Card */}
        <div
          className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3 cursor-pointer"
          onClick={() => onNavigate('media')}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[13px] text-gray-400">📱 오늘 미디어</span>
            <span className="text-lg font-bold text-gray-500">{mediaMin}분</span>
          </div>
          <div className="text-[12px] text-muted-foreground">{mediaMsg}</div>
        </div>

        <WeeklyChart />

        {/* Bible Progress */}
        <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-semibold text-card-foreground">성경 읽기 진도</span>
            <span className="text-sm font-bold text-primary">{biblePct}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[#A855F7] rounded-full transition-all duration-500"
              style={{ width: `${biblePct}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1.5">
            {readCount.toLocaleString()} / {TOTAL_CHAPTERS.toLocaleString()} 장 완료
          </div>
        </div>
      </div>
    </div>
  )
}
