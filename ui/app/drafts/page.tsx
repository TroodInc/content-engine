import Link from 'next/link'

type DraftStatus = 'draft' | 'ready' | 'published'

type Draft = {
  id: string
  title: string
  status: DraftStatus
  created_at: string
  topic_name: string
}

const DRAFTS: Draft[] = [
  {
    id: '1',
    title: 'How AI Is Transforming Legal Research in 2026',
    status: 'ready',
    created_at: '2026-05-09',
    topic_name: 'AI in Legal Tech',
  },
  {
    id: '2',
    title: 'Building a Production RAG Pipeline with LangChain',
    status: 'draft',
    created_at: '2026-05-07',
    topic_name: 'RAG Pipelines',
  },
  {
    id: '3',
    title: 'Automating Content Workflows End-to-End',
    status: 'published',
    created_at: '2026-05-02',
    topic_name: 'Content Automation',
  },
  {
    id: '4',
    title: 'LoRA vs Full Fine-tuning: When Each Approach Wins',
    status: 'draft',
    created_at: '2026-04-28',
    topic_name: 'LLM Fine-tuning',
  },
]

const STATUS_COUNTS = DRAFTS.reduce(
  (acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }),
  {} as Record<DraftStatus, number>,
)

export default function DraftsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Drafts</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {STATUS_COUNTS.ready ?? 0} ready &middot; {STATUS_COUNTS.draft ?? 0} in progress &middot; {STATUS_COUNTS.published ?? 0} published
          </p>
        </div>
      </header>

      <div className="space-y-2">
        {DRAFTS.map((draft) => (
          <Link key={draft.id} href={`/drafts/${draft.id}`} className="block group">
            <div className="flex items-center justify-between gap-4 px-4 py-4 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] group-hover:border-zinc-500 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                  {draft.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{draft.topic_name}</p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <StatusBadge status={draft.status} />
                <span className="text-xs text-zinc-600 tabular-nums">
                  {formatDate(draft.created_at)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<DraftStatus, { dot: string; label: string; classes: string }> = {
  draft:     { dot: 'bg-amber-400',  label: 'Draft',     classes: 'bg-amber-900/40 text-amber-400' },
  ready:     { dot: 'bg-emerald-400',label: 'Ready',     classes: 'bg-emerald-900/40 text-emerald-400' },
  published: { dot: 'bg-zinc-500',   label: 'Published', classes: 'bg-zinc-700 text-zinc-400' },
}

function StatusBadge({ status }: { status: DraftStatus }) {
  const { dot, label, classes } = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
