"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, LoginCredentials, RegisterData } from "@/lib/types"
import { AuthService } from "@/lib/services"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "train-system-auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        const userData = JSON.parse(stored) as User
        const validUser = AuthService.validateSession(userData.id)
        if (validUser) {
          setUser(validUser)
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const result = AuthService.login(credentials)
    if (result) {
      setUser(result)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result))
      return { success: true }
    }
    return { success: false, error: "Invalid email or password" }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const result = AuthService.register(data)
    if ("error" in result) {
      return { success: false, error: result.error }
    }
    setUser(result)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
