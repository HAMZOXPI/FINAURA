export default function BoostCenterLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-36 rounded-3xl bg-surface-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 rounded-2xl bg-surface-100" />
        <div className="h-44 rounded-2xl bg-surface-100" />
      </div>
      <div className="h-64 rounded-2xl bg-surface-100" />
    </div>
  );
}
