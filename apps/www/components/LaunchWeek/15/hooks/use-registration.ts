import { useCallback, useEffect, useRef, useState } from 'react'

import useConfData from './use-conf-data'
import { LW14_URL } from '@/lib/constants'

interface RegistrationProps {
  onRegister?: () => void
  onError?: (error: any) => void
}

export const useRegistration = ({ onError, onRegister }: RegistrationProps = {}) => {
  const [
    { userTicketData: userData, session, userTicketDataState, urlParamsLoaded, referal },
    dispatch,
  ] = useConfData()
  const sessionUser = session?.user
  const callbacksRef = useRef({ onError, onRegister })

  // Stub: Database operations removed - Supabase completely disabled
  const fetchOrCreateUser = useCallback(async () => {
    // This is now a stub - no-op placeholder
    callbacksRef.current.onRegister?.()
  }, [dispatch, referal, sessionUser, urlParamsLoaded, userData.id, userTicketDataState])

  const handleGithubSignIn = useCallback(async () => {
    // Stub: OAuth removed - Supabase completely disabled
    console.warn('GitHub sign-in disabled - Supabase removed')
  }, [referal])

  useEffect(() => {
    fetchOrCreateUser()
  }, [fetchOrCreateUser])

  useEffect(() => {
    // Stub: Auth state management removed - Supabase completely disabled
  }, [dispatch])

  useEffect(() => {
    callbacksRef.current = { onError, onRegister }
  })

  const upgradeTicket = async () => {
    // Stub: Ticket upgrade removed - Supabase completely disabled
    console.warn('Ticket upgrade disabled - Supabase removed')
  }

  return {
    signIn: handleGithubSignIn,
    upgradeTicket,
  }
}

// Stub: Ticket color update disabled
export function updateTicketColors() {
  return null
}
