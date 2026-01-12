import { useCallback, useEffect, useState } from 'react'
import useLw14ConfData from './use-conf-data'

const LW14_TOPIC = 'lw14'
const GAUGES_UPDATES_EVENT = 'gauges-update'

export const usePartymode = () => {
  const [state, dispatch] = useLw14ConfData()

  // Stub: Realtime and RPC removed - Supabase completely disabled
  const createChannelAndSubscribe = useCallback(() => {
    console.warn('Realtime partymode disabled - Supabase removed')
    return null
  }, [dispatch])

  const toggle = useCallback(async () => {
    // Stub: Partymode toggling disabled
    console.warn('Partymode toggling disabled - Supabase removed')
  }, [createChannelAndSubscribe, dispatch, state.partymodeStatus, state.realtimeGaugesChannel])

  const fetchGaugesData = useCallback(async () => {
    // Stub: RPC calls removed - Supabase completely disabled
    console.warn('Gauges data fetch disabled - Supabase removed')
  }, [dispatch])

  useEffect(() => {
    // Stub: Realtime subscription removed
  }, [
    createChannelAndSubscribe,
    fetchGaugesData,
    state.partymodeStatus,
    state.realtimeGaugesChannel,
  ])

  return {
    toggle,
  }
}
