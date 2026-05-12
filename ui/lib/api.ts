const BASE = 'http://localhost:3001/api'

export type ApiError = {
  error: true
  message: string
  status?: number
}

export type ApiResult<T> = T | ApiError

export function isApiError<T>(result: ApiResult<T>): result is ApiError {
  return typeof result === 'object' && result !== null && (result as ApiError).error === true
}

async function post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      return { error: true, message: `Server error: ${res.status} ${res.statusText}`, status: res.status }
    }
    return res.json() as Promise<T>
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

async function get<T>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`)
    if (!res.ok) {
      return { error: true, message: `Server error: ${res.status} ${res.statusText}`, status: res.status }
    }
    return res.json() as Promise<T>
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// --- Pipeline actions ---

export type AnalyzeResult = { posts_read: number; signals_extracted: number }
export type ScheduleResult = { topics_reviewed: number; articles_planned: number }
export type WriteResult   = { draft_id: string; title: string }
export type PublishResult = { published: number; failed: number }

export type Topic = { id: string; name: string; description: string; article_count: number; created_at: string }
export type Draft = { id: string; title: string; status: 'draft' | 'ready' | 'published'; created_at: string; topic_name: string }

export function analyzePipeline()              { return post<AnalyzeResult>('/analyze') }
export function schedulePipeline()             { return post<ScheduleResult>('/schedule') }
export function writeDraft(query: string)      { return post<WriteResult>('/write', { query }) }
export function publishDrafts()                { return post<PublishResult>('/publish') }
export function getTopics()                    { return get<Topic[]>('/topics') }
export function getDrafts()                    { return get<Draft[]>('/drafts') }
