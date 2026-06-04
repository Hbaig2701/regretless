import { CATEGORIES } from "@/lib/types";

export default function CategoryBadge({
  categoryId,
  truncate = false,
}: {
  categoryId: number;
  truncate?: boolean;
}) {
  const category = CATEGORIES[categoryId];
  if (!category) return null;

  return (
    <span className="inline-block px-3 py-1 text-[0.65rem] uppercase tracking-wider font-medium border border-border rounded-full bg-cream text-dark/70">
      {truncate && category.name.length > 18
        ? category.short + "..."
        : category.short}
    </span>
  );
}
