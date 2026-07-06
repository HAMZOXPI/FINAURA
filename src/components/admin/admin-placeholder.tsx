interface AdminPlaceholderProps {
  title: string;
  description: string;
}

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-300 bg-white px-6 py-16 text-center">
      <p className="text-xl font-bold text-surface-900">{title}</p>
      <p className="mt-2 text-sm text-surface-500">{description}</p>
    </div>
  );
}
