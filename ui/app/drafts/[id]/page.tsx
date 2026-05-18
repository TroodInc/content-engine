import { notFound } from 'next/navigation'
import DraftEditor from './DraftEditor'

type DraftStatus = 'draft' | 'ready' | 'published'

const DRAFTS = [
  {
    id: '1',
    title: 'How AI Is Transforming Legal Research in 2026',
    status: 'ready' as DraftStatus,
    created_at: '2026-05-09',
    topic_name: 'AI in Legal Tech',
    sources: [
      { title: 'How GPT-4 Is Changing Legal Research Forever', url: 'https://legaltech.com/gpt4-legal-research' },
      { title: 'AI Contract Review: Risks and Opportunities', url: 'https://abajournalai.com/contract-review' },
      { title: 'The Rise of AI-Assisted Litigation Strategy', url: 'https://lawreview.org/ai-litigation' },
    ],
    content: `# How AI Is Transforming Legal Research in 2026

Legal professionals have long relied on exhaustive manual research to build cases and advise clients. That process is changing fast.

## The Research Revolution

Modern **large language models** are now capable of ingesting thousands of case documents and surfacing relevant precedent in seconds. Tools like *Westlaw AI* and *Lexis+ AI* allow attorneys to query in plain English rather than crafting complex Boolean searches.

\`\`\`
Query: "cases where force majeure clause was upheld in supply chain disputes"
Results: 142 cases matched · Top match: 94% relevance
\`\`\`

## Contract Review at Scale

AI-assisted contract review has reduced turnaround time for due diligence from **weeks to hours**. Models trained on millions of commercial contracts can flag non-standard clauses, missing indemnities, and jurisdiction mismatches automatically.

Key capabilities now standard in enterprise tooling:

- Clause extraction and classification
- Deviation detection against playbooks
- Risk scoring across entire contract portfolios

## What Lawyers Still Do Better

Despite rapid capability gains, AI tools still struggle with:

- Novel legal arguments with no clear precedent
- Jurisdictional nuance across multiple legal systems
- Ethical judgement calls requiring human context

The most effective firms treat AI as a **research paralegal** — fast, thorough, tireless — while keeping senior judgment firmly in human hands.
`,
  },
  {
    id: '2',
    title: 'Building a Production RAG Pipeline with LangChain',
    status: 'draft' as DraftStatus,
    created_at: '2026-05-07',
    topic_name: 'RAG Pipelines',
    sources: [
      { title: 'Building a Production RAG Pipeline with LangChain', url: 'https://langchain.com/blog/rag-production' },
      { title: 'RAG vs Fine-tuning: When to Use Each', url: 'https://huggingface.co/blog/rag-vs-finetuning' },
      { title: 'Chunking Strategies for Better Retrieval Accuracy', url: 'https://devto.io/chunking-strategies-rag' },
    ],
    content: `# Building a Production RAG Pipeline with LangChain

Retrieval-augmented generation is now the default architecture for grounded LLM applications. Here is how to build one that holds up in production.

## The Core Loop

A RAG pipeline has three stages: **ingest**, **retrieve**, and **generate**.

\`\`\`
Document → Chunk → Embed → Store
Query → Embed → Search → Retrieve → Prompt → LLM → Response
\`\`\`

## Chunking Strategy Matters More Than You Think

Naive fixed-size chunking loses semantic coherence at boundaries. Better approaches:

- *Recursive character splitting* with overlap for prose
- *Sentence-window chunking* for dense technical docs
- *Hierarchical chunking* when document structure carries meaning

## Retrieval Tuning

A vector similarity search alone often retrieves the right document but the wrong chunk. Combine with:

- **BM25 sparse retrieval** for keyword-heavy queries
- **Re-ranking** with a cross-encoder to reorder top-k results
- **MMR (Maximal Marginal Relevance)** to reduce redundancy in retrieved chunks
`,
  },
  {
    id: '3',
    title: 'Automating Content Workflows End-to-End',
    status: 'published' as DraftStatus,
    created_at: '2026-05-02',
    topic_name: 'Content Automation',
    sources: [
      { title: 'How We Publish 200 Articles a Month with AI', url: 'https://contentops.io/200-articles-ai' },
      { title: 'Automating SEO Research with LLM Agents', url: 'https://ahrefs.com/blog/llm-seo-automation' },
      { title: 'CMS Integrations for Automated Publishing', url: 'https://smashingmagazine.com/cms-automation' },
    ],
    content: `# Automating Content Workflows End-to-End

Publishing at scale used to mean hiring a large editorial team. With the right pipeline, a small team can now produce and maintain a high-volume content operation.

## Pipeline Stages

A complete automation pipeline covers six stages:

- **Research** — crawl sources, extract signal, rank by relevance
- **Clustering** — group related articles into topic buckets
- **Outlining** — generate structured outlines from cluster summaries
- **Drafting** — produce full drafts with citations from source material
- **Review** — human editorial pass, fact-checking, tone alignment
- **Publishing** — push to CMS, schedule, update internal links

## Where Humans Stay In the Loop

Full automation without human review produces mediocre content at scale. The leverage point is **review**, not generation.

Treat the AI as a first-draft engine and a *strong editor* as the quality gate.
`,
  },
  {
    id: '4',
    title: 'LoRA vs Full Fine-tuning: When Each Approach Wins',
    status: 'draft' as DraftStatus,
    created_at: '2026-04-28',
    topic_name: 'LLM Fine-tuning',
    sources: [
      { title: 'Fine-tuning Llama 3 on Domain-Specific Data', url: 'https://meta.ai/blog/llama3-finetuning' },
      { title: 'LoRA Explained: Efficient Fine-tuning Without Full Retraining', url: 'https://arxiv.org/abs/lora-explained' },
      { title: 'When Fine-tuning Hurts More Than It Helps', url: 'https://lesswrong.com/finetuning-pitfalls' },
    ],
    content: `# LoRA vs Full Fine-tuning: When Each Approach Wins

Fine-tuning a language model on your own data can dramatically improve task performance — but the method you choose shapes cost, quality, and maintainability.

## Full Fine-tuning

Full fine-tuning updates **every parameter** in the model. It produces the highest task fidelity but requires significant GPU memory and time.

When to use it:

- You have a large, high-quality dataset (>100k examples)
- The target domain is structurally very different from pretraining data
- You can afford the compute and want maximum control

## LoRA (Low-Rank Adaptation)

LoRA freezes the base model and injects small *trainable rank-decomposition matrices* at each layer. The result is a tiny adapter that can be swapped in and out.

\`\`\`
Parameters trained: ~0.1–1% of full model
Memory reduction: 3–10x vs full fine-tuning
Quality gap: Minimal for most tasks
\`\`\`

## QLoRA: The Practical Sweet Spot

**QLoRA** combines 4-bit quantization with LoRA adapters. A 70B model that normally requires 8×A100s can be fine-tuned on a single A100 80GB.

For most production use cases — domain adaptation, style transfer, instruction following — *QLoRA is the right default*.
`,
  },
]

export default function DraftDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const draft = DRAFTS.find((d) => d.id === id)
  if (!draft) notFound()

  return <DraftEditor draft={draft} />
}
