"use client";

type TagFilterProps = {
  tags: { value: string; count: number }[];
  active: string[];
  onToggle: (tag: string) => void;
};

export function TagFilter({ tags, active, onToggle }: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-wrap gap-2">
      {tags.map((tag) => {
        const isActive = active.includes(tag.value);
        return (
          <button
            type="button"
            key={tag.value}
            onClick={() => onToggle(tag.value)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.97] ${
              isActive
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-200 hover:text-blue-500"
            }`}
          >
            #{tag.value}
            <span
              className={`text-xs ${
                isActive ? "text-white/80" : "text-zinc-400"
              }`}
            >
              {tag.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
