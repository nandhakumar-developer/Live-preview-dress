export default function AdminLoading() {
  return (
    <div
      aria-label="Loading admin page"
      aria-busy="true"
      className="animate-pulse"
    >
      <div className="space-y-6">
        <div className="h-9 w-56 rounded-lg bg-[#E8E2D8]" />
        <div className="h-5 w-80 max-w-full rounded bg-[#F4EFEB]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 rounded-2xl border border-[#E8E2D8] bg-white" />
          <div className="h-32 rounded-2xl border border-[#E8E2D8] bg-white" />
          <div className="h-32 rounded-2xl border border-[#E8E2D8] bg-white" />
        </div>
        <div className="h-64 rounded-2xl border border-[#E8E2D8] bg-white" />
      </div>
    </div>
  );
}
