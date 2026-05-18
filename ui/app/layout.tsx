import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Content Engine',
  description: 'AI-powered content pipeline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full text-zinc-100 antialiased" style={{ backgroundColor: '#111111' }}>
        <Sidebar />
        <main className="ml-56 min-h-screen p-8" style={{ backgroundColor: '#111111' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
