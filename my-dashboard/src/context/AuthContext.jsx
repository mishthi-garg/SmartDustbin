import { createContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext(null)

const DEMO_USER = { id: 'demo', email: 'demo@campus.in', full_name: 'Demo Worker', role: 'worker' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // { id, email, full_name, role }
  const [loading, setLoading] = useState(true)

  const loadProfile = async (session) => {
    if (!session) return setUser(null)
    const { data } = await supabase
      .from('profiles').select('full_name, role')
      .eq('id', session.user.id).single()
    setUser(data ? { id: session.user.id, email: session.user.email, ...data } : null)
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // setTimeout: calling supabase inside this callback directly can deadlock
      setTimeout(async () => {
        await loadProfile(session)
        setLoading(false)
      }, 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    if (!supabase) {
      setUser({ ...DEMO_USER, role: email.includes('admin') ? 'admin' : 'worker' })
      return {}
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}