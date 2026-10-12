// Shown instantly while a dashboard page's data loads, so navigation never waits on the database
export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse" role="status" aria-label="Loading">
      <div className="mb-8 space-y-3">
        <div className="h-7 w-56 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-gray-100 dark:bg-gray-800/60" />
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900" />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
