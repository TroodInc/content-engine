import Link from 'next/link'
import { notFound } from 'next/navigation'

type Article = {
  id: string
  title: string
  source_url: string
  similarity: number
}

type Topic = {
  id: string
  name: string
  description: string
  article_count: number
  created_at: string
  articles: Article[]
}

const TOPICS: Topic[] = [
  {
    id: '1',
    name: 'AI in Legal Tech',
    description: 'How artificial intelligence is reshaping legal research, contract review, and litigation strategy.',
    article_count: 12,
    created_at: '2026-03-01',
    articles: [
      { id: 'a1', title: 'How GPT-4 Is Changing Legal Research Forever', source_url: 'https://legaltech.com/gpt4-legal-research', similarity: 97 },
      { id: 'a2', title: 'AI Contract Review: Risks and Opportunities for Law Firms', source_url: 'https://abajournalai.com/contract-review', similarity: 91 },
      { id: 'a3', title: 'The Rise of AI-Assisted Litigation Strategy', source_url: 'https://lawreview.org/ai-litigation', similarity: 85 },
      { id: 'a4', title: 'Ethical Concerns Around AI Predictions in Sentencing', source_url: 'https://jlegalethics.org/ai-sentencing', similarity: 78 },
      { id: 'a5', title: 'LegalTech Startups Attracting Record Venture Funding', source_url: 'https://techcrunch.com/legaltech-funding-2026', similarity: 72 },
    ],
  },
  {
    id: '2',
    name: 'RAG Pipelines',
    description: 'Retrieval-augmented generation patterns for building accurate, grounded LLM applications.',
    article_count: 7,
    created_at: '2026-03-14',
    articles: [
      { id: 'b1', title: 'Building a Production RAG Pipeline with LangChain', source_url: 'https://langchain.com/blog/rag-production', similarity: 96 },
      { id: 'b2', title: 'RAG vs Fine-tuning: When to Use Each', source_url: 'https://huggingface.co/blog/rag-vs-finetuning', similarity: 88 },
      { id: 'b3', title: 'Chunking Strategies for Better Retrieval Accuracy', source_url: 'https://devto.io/chunking-strategies-rag', similarity: 83 },
      { id: 'b4', title: 'Evaluating RAG Systems with RAGAS', source_url: 'https://ragas.io/docs/evaluation', similarity: 79 },
    ],
  },
  {
    id: '3',
    name: 'Content Automation',
    description: 'Workflows and tooling for automating content research, drafting, and publishing at scale.',
    article_count: 18,
    created_at: '2026-02-20',
    articles: [
      { id: 'c1', title: 'How We Publish 200 Articles a Month with AI Assistance', source_url: 'https://contentops.io/200-articles-ai', similarity: 95 },
      { id: 'c2', title: 'Automating SEO Research with LLM Agents', source_url: 'https://ahrefs.com/blog/llm-seo-automation', similarity: 89 },
      { id: 'c3', title: 'Building a Content Calendar Generator in Python', source_url: 'https://towardsdatascience.com/content-calendar-generator', similarity: 81 },
      { id: 'c4', title: 'The Hidden Costs of AI Content at Scale', source_url: 'https://nieman.harvard.edu/ai-content-costs', similarity: 74 },
      { id: 'c5', title: 'CMS Integrations for Automated Publishing Pipelines', source_url: 'https://smashingmagazine.com/cms-automation', similarity: 70 },
    ],
  },
  {
    id: '4',
    name: 'LLM Fine-tuning',
    description: 'Techniques for adapting foundation models to domain-specific tasks using custom datasets.',
    article_count: 5,
    created_at: '2026-04-02',
    articles: [
      { id: 'd1', title: 'Fine-tuning Llama 3 on Domain-Specific Data', source_url: 'https://meta.ai/blog/llama3-finetuning', similarity: 94 },
      { id: 'd2', title: 'LoRA Explained: Efficient Fine-tuning Without Full Retraining', source_url: 'https://arxiv.org/abs/lora-explained', similarity: 90 },
      { id: 'd3', title: 'When Fine-tuning Hurts More Than It Helps', source_url: 'https://lesswrong.com/finetuning-pitfalls', similarity: 76 },
    ],
  },
  {
    id: '5',
    name: 'Vector Databases',
    description: 'Comparing Pinecone, Weaviate, Qdrant, and pgvector for semantic search and retrieval.',
    article_count: 9,
    created_at: '2026-04-18',
    articles: [
      { id: 'e1', title: 'Pinecone vs Weaviate vs Qdrant: A Deep Comparison', source_url: 'https://benchmarks.vectordb.io/comparison-2026', similarity: 98 },
      { id: 'e2', title: 'Using pgvector for Semantic Search in Postgres', source_url: 'https://supabase.com/blog/pgvector-semantic-search', similarity: 87 },
      { id: 'e3', title: 'Approximate Nearest Neighbor Algorithms Explained', source_url: 'https://cs.stanford.edu/ann-explainer', similarity: 82 },
      { id: 'e4', title: 'Scaling Vector Search to a Billion Embeddings', source_url: 'https://engineering.netflix.com/vector-search-scale', similarity: 77 },
    ],
  },
]

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const topic = TOPICS.find((t) => t.id === id)
  if (!topic) notFound()

  const sorted = [...topic.articles].sort((a, b) => b.similarity - a.similarity)

  return (
    <div className="max-w-3xl">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-7"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2L4 6l4 4" />
        </svg>
        All Topics
      </Link>

      <header className="mb-8 pb-6 border-b border-zinc-800">
        <h1 className="text-2xl font-semibold text-white">{topic.name}</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-xl">{topic.description}</p>
        <p className="mt-3 text-xs text-zinc-600">
          Created {new Date(topic.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          &nbsp;·&nbsp;
          <span className="text-zinc-500">{topic.articles.length} linked articles</span>
        </p>
      </header>

      <section>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
          Linked Articles
        </h2>
        <div className="space-y-2">
          {sorted.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ArticleRow({ article }: { article: Article }) {
  const hostname = safeHostname(article.source_url)

  return (
    <div className="rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] px-4 py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100 leading-snug">{article.title}</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 6a2.5 2.5 0 0 0 3.5.4l1.5-1.5a2.5 2.5 0 0 0-3.5-3.5L5 2.9" />
              <path d="M6.5 5a2.5 2.5 0 0 0-3.5-.4L1.5 6.1a2.5 2.5 0 0 0 3.5 3.5L6 8.1" />
            </svg>
            <span className="truncate">{hostname}</span>
          </div>
        </div>
        <SimilarityBadge score={article.similarity} />
      </div>
    </div>
  )
}

function SimilarityBadge({ score }: { score: number }) {
  const { bg, text } =
    score >= 90
      ? { bg: 'bg-emerald-900/50', text: 'text-emerald-400' }
      : score >= 75
      ? { bg: 'bg-sky-900/50', text: 'text-sky-400' }
      : { bg: 'bg-zinc-700', text: 'text-zinc-400' }

  return (
    <span className={`shrink-0 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold tabular-nums ${bg} ${text}`}>
      {score}% match
    </span>
  )
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
