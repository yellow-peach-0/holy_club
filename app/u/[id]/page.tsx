import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfileView } from './profile-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Get last 7 days of records
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const { data: records } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', id)
    .gte('date', weekAgo.toISOString().slice(0, 10))
    .order('date', { ascending: false })

  return <ProfileView user={user} records={records || []} />
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('nickname')
    .eq('id', id)
    .single()

  return {
    title: user ? `${user.nickname}님의 경건 기록 - Holy Club` : 'Holy Club',
    description: user ? `${user.nickname}님의 성경 읽기, 기도, 미디어 사용 기록을 확인해보세요` : '경건 생활 트래커',
  }
}
