'use client'

interface ThemeProviderProps {
  readonly children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
