import ActionCards from './ActionCards'

export default function ActionsPage() {
  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Actions</h1>
        <p className="mt-1 text-sm text-zinc-400">Run pipeline operations on your content</p>
      </header>
      <ActionCards />
    </div>
  )
}
