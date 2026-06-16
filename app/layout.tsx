import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Egzamin Groomera – Fiszki',
  description: 'Aplikacja do nauki na egzamin groomera',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
