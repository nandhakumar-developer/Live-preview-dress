export default function AdminLoading() {
  return (
    <div
      aria-label="Loading admin page"
      aria-busy="true"
      className="min-h-screen animate-pulse bg-[#FAF8F5] md:flex"
    >
      <aside className="hidden w-64 shrink-0 border-r border-[#E8E2D8] bg-white p-6 md:block">
        <div className="mb-8 h-10 rounded-lg bg-[#F4EFEB]" />
        <div className="space-y-3">
          <div className="h-10 rounded-xl bg-[#F4EFEB]" />
          <div className="h-10 rounded-xl bg-[#F4EFEB]" />
          <div className="h-10 rounded-xl bg-[#F4EFEB]" />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-9 w-56 rounded-lg bg-[#E8E2D8]" />
          <div className="h-5 w-80 max-w-full rounded bg-[#F4EFEB]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 rounded-2xl border border-[#E8E2D8] bg-white" />
            <div className="h-32 rounded-2xl border border-[#E8E2D8] bg-white" />
            <div className="h-32 rounded-2xl border border-[#E8E2D8] bg-white" />
          </div>
          <div className="h-64 rounded-2xl border border-[#E8E2D8] bg-white" />
        </div>
      </main>
    </div>
  );
}
