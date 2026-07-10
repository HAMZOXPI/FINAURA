export default function AdminBoostLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-32 rounded-2xl bg-surface-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-surface-100" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-surface-100" />
      <div className="h-72 rounded-2xl bg-surface-100" />
    </div>
  );
}
