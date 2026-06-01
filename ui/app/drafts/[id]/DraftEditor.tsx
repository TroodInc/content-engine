'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

type DraftStatus = 'draft' | 'ready' | 'published'

type Source = {
  title: string
  url: string
}

type DraftData = {
  id: string
  title: string
  status: DraftStatus
  created_at: string
  topic_name: string
  content: string
  sources: Source[]
}

const STATUS_STYLES: Record<DraftStatus, { dot: string; label: string; classes: string }> = {
  draft:     { dot: 'bg-amber-400',   label: 'Draft',     classes: 'bg-amber-900/40 text-amber-400' },
  ready:     { dot: 'bg-emerald-400', label: 'Ready',     classes: 'bg-emerald-900/40 text-emerald-400' },
  published: { dot: 'bg-zinc-500',    label: 'Published', classes: 'bg-zinc-700 text-zinc-400' },
}

export default function DraftEditor({ draft }: { draft: DraftData }) {
  const [text, setText] = useState(draft.content)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastFading, setToastFading] = useState(false)

  const { dot, label, classes } = STATUS_STYLES[draft.status]

  const handlePublish = useCallback(() => {
    setToastVisible(true)
    setToastFading(false)
    const fadeTimer = setTimeout(() => setToastFading(true), 2200)
    const hideTimer = setTimeout(() => setToastVisible(false), 2700)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/drafts"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-7"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2L4 6l4 4" />
        </svg>
        All Drafts
      </Link>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white leading-snug">{draft.title}</h1>
          <div className="shrink-0 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {label}
            </span>
            <button
              onClick={handlePublish}
              className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-900 text-xs font-semibold hover:bg-white transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-600">
          {draft.topic_name}
          <span className="mx-1.5">·</span>
          <span className="text-zinc-500">
            Created {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </p>
      </header>

      {/* Sources */}
      <section className="mb-8">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
          Sources Used
        </h2>
        <div className="space-y-2">
          {draft.sources.map((source, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a]">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-zinc-200 font-medium leading-snug">{source.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 truncate">{source.url}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
          Preview
        </h2>
        <div className="rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] px-6 py-5 prose-dark overflow-auto">
          <MarkdownPreview source={text} />
        </div>
      </section>

      {/* Editor */}
      <section>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
          Editor
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="w-full min-h-72 rounded-lg bg-[#111111] border border-[#2a2a2a] focus:border-zinc-500 focus:outline-none px-4 py-3.5 text-sm text-zinc-200 font-mono leading-relaxed resize-y transition-colors"
        />
      </section>

      {/* Toast */}
      {toastVisible && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] shadow-xl text-sm text-zinc-100 transition-opacity duration-500 ${toastFading ? 'opacity-0' : 'opacity-100'}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          Draft published successfully.
        </div>
      )}
    </div>
  )
}

function MarkdownPreview({ source }: { source: string }) {
  const nodes = parseMarkdown(source)
  return <div className="space-y-3">{nodes}</div>
}

function parseMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      nodes.push(
        <pre key={i} className="rounded-md bg-[#111111] border border-[#2a2a2a] px-4 py-3 text-xs font-mono text-zinc-300 overflow-x-auto">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Headings
    const h3 = line.match(/^### (.+)/)
    if (h3) { nodes.push(<h3 key={i} className="text-base font-semibold text-white">{inline(h3[1])}</h3>); i++; continue }
    const h2 = line.match(/^## (.+)/)
    if (h2) { nodes.push(<h2 key={i} className="text-lg font-semibold text-white">{inline(h2[1])}</h2>); i++; continue }
    const h1 = line.match(/^# (.+)/)
    if (h1) { nodes.push(<h1 key={i} className="text-xl font-bold text-white">{inline(h1[1])}</h1>); i++; continue }

    // Unordered list — collect consecutive list items
    if (line.match(/^[-*] /)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(<li key={i}>{inline(lines[i].replace(/^[-*] /, ''))}</li>)
        i++
      }
      nodes.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-sm text-zinc-300">{items}</ul>)
      continue
    }

    // Blank line
    if (line.trim() === '') { i++; continue }

    // Paragraph
    nodes.push(<p key={i} className="text-sm text-zinc-300 leading-relaxed">{inline(line)}</p>)
    i++
  }

  return nodes
}

function inline(text: string): React.ReactNode {
  // Split on **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic text-zinc-200">{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="px-1 py-0.5 rounded bg-zinc-700 text-zinc-200 text-xs font-mono">{part.slice(1, -1)}</code>
    return part
  })
}
