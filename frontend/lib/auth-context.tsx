"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "./api"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff" | "guest"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored user and token on mount
    const storedUser = localStorage.getItem("healthcare_user")
    const storedToken = localStorage.getItem("healthcare_token")
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        localStorage.removeItem("healthcare_user")
        localStorage.removeItem("healthcare_token")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password)
      
      if (response.access_token && response.user) {
        setUser(response.user)
        setToken(response.access_token)
        localStorage.setItem("healthcare_user", JSON.stringify(response.user))
        localStorage.setItem("healthcare_token", response.access_token)
        return true
      }
      
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("healthcare_user")
    localStorage.removeItem("healthcare_token")
    // Redirect to login - use window.location for SSR compatibility
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
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
