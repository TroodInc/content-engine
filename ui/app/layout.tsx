import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Content Engine',
  description: 'AI-powered content pipeline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full text-zinc-100 antialiased" style={{ backgroundColor: '#111111' }}>
        <Sidebar />
        <main className="ml-56 min-h-screen p-8" style={{ backgroundColor: '#111111' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
