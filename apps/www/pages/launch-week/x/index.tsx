import { useState } from 'react'
import { useRouter } from 'next/router'

const LaunchWeekX = () => {
  const { query } = useRouter()

  return <div className="min-h-screen p-8">Launch Week X - Supabase disabled</div>
}

export default LaunchWeekX
