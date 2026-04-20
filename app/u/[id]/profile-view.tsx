'use client'

import Link from 'next/link'

interface User {
  id: string
  nickname: string
  created_at: string
}

interface DailyRecord {
  id: string
  date: string
  bible_chapters: number
  prayer_minutes: number
  media_minutes: number
  bible_read: Record<string, boolean>
  media_usage: Record<string, number>
}

interface ProfileViewProps {
  user: User
  records: DailyRecord[]
}

export function ProfileView({ user, records }: ProfileViewProps) {
  const today = new Date().toISOString().slice(0, 10)
  const todayRecord = records.find(r => r.date === today)
  
  // Calculate weekly stats
  const weeklyStats = {
    bibleChapters: records.reduce((sum, r) => sum + (r.bible_chapters || 0), 0),
    prayerMinutes: records.reduce((sum, r) => sum + (r.prayer_minutes || 0), 0),
    mediaMinutes: records.reduce((sum, r) => sum + (r.media_minutes || 0), 0),
  }

  // Get last 7 days for chart
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const record = records.find(r => r.date === dateStr)
    days.push({
      date: dateStr,
      day: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
      bible: record?.bible_chapters || 0,
      prayer: record?.prayer_minutes || 0,
      media: record?.media_minutes || 0,
    })
  }

  const maxValue = Math.max(...days.map(d => Math.max(d.bible, d.prayer, d.media)), 1)

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent to-primary text-white p-6 pb-8 rounded-b-[24px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            ✝️
          </div>
          <div>
            <h1 className="text-xl font-bold m-0">{user.nickname}</h1>
            <p className="text-white/70 text-sm m-0">
              {new Date(user.created_at).toLocaleDateString('ko-KR')}부터 함께
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">이번 주 요약</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{weeklyStats.bibleChapters}</div>
              <div className="text-xs text-muted-foreground">성경 장</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{weeklyStats.prayerMinutes}</div>
              <div className="text-xs text-muted-foreground">기도 분</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{weeklyStats.mediaMinutes}</div>
              <div className="text-xs text-muted-foreground">미디어 분</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">주간 기록</h2>
          <div className="flex gap-2 justify-between">
            {days.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="h-24 flex flex-col justify-end gap-0.5 mb-1">
                  {d.bible > 0 && (
                    <div 
                      className="bg-accent rounded-sm"
                      style={{ height: `${(d.bible / maxValue) * 100}%`, minHeight: '4px' }}
                    />
                  )}
                  {d.prayer > 0 && (
                    <div 
                      className="bg-primary rounded-sm"
                      style={{ height: `${(d.prayer / maxValue) * 100}%`, minHeight: '4px' }}
                    />
                  )}
                  {d.media > 0 && (
                    <div 
                      className="bg-orange-400 rounded-sm"
                      style={{ height: `${(d.media / maxValue) * 100}%`, minHeight: '4px' }}
                    />
                  )}
                </div>
                <div className={`text-xs ${d.date === today ? 'font-bold text-accent' : 'text-muted-foreground'}`}>
                  {d.day}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center mt-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-accent" /> 성경
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-primary" /> 기도
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-orange-400" /> 미디어
            </span>
          </div>
        </div>
      </div>

      {/* Today's Record */}
      {todayRecord && (
        <div className="px-4 mt-4">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">오늘의 기록</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">📖 성경 읽기</span>
                <span className="font-semibold">{todayRecord.bible_chapters}장</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">🙏 기도</span>
                <span className="font-semibold">{todayRecord.prayer_minutes}분</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">📱 미디어</span>
                <span className="font-semibold">{todayRecord.media_minutes}분</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 mt-6">
        <Link 
          href="/"
          className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-xl font-semibold no-underline"
        >
          나도 Holy Club 시작하기
        </Link>
      </div>
    </div>
  )
}
