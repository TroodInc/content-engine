'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Dashboard', href: '/' },
  { label: 'Topics', href: '/topics' },
  { label: 'Drafts', href: '/drafts' },
  { label: 'Actions', href: '/actions' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col bg-zinc-950 border-r border-zinc-800">
      <div className="px-5 py-5 border-b border-zinc-800">
        <span className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          Content
        </span>
        <span className="text-sm font-semibold tracking-widest text-white uppercase">
          Engine
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
              ].join(' ')}
            >
              <NavIcon name={label} active={active} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">v0.1.0</p>
      </div>
    </aside>
  )
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'currentColor' : 'currentColor'
  const size = 16

  const icons: Record<string, React.ReactNode> = {
    Dashboard: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
    Topics: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="8" cy="8" r="6.5" />
        <circle cx="8" cy="8" r="2" />
        <line x1="8" y1="1.5" x2="8" y2="6" />
        <line x1="8" y1="10" x2="8" y2="14.5" />
        <line x1="1.5" y1="8" x2="6" y2="8" />
        <line x1="10" y1="8" x2="14.5" y2="8" />
      </svg>
    ),
    Drafts: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M10 2v3h3" />
        <line x1="4" y1="7" x2="12" y2="7" />
        <line x1="4" y1="10" x2="9" y2="10" />
      </svg>
    ),
    Actions: (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5">
        <polygon points="3,1 13,8 3,15" />
      </svg>
    ),
  }

  return <span className="shrink-0">{icons[name]}</span>
}
