"use client";

import { formatDistanceToNow } from "date-fns";

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type NoteCardProps = {
  note: Note;
  isActive?: boolean;
  onSelect: (note: Note) => void;
};

export function NoteCard({ note, isActive, onSelect }: NoteCardProps) {
  const formattedUpdatedAt = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
  });

  return (
    <button
      type="button"
      onClick={() => onSelect(note)}
      className={`flex w-full flex-col gap-4 rounded-3xl border border-transparent bg-white p-5 text-left shadow-sm ring-1 ring-zinc-100 transition active:scale-[0.99] ${
        isActive ? "ring-2 ring-blue-500/60" : "hover:shadow-md"
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {formattedUpdatedAt}
        </span>
        <h3 className="text-lg font-semibold text-zinc-900">
          {note.title || "Untitled note"}
        </h3>
      </div>

      <p className="max-h-32 overflow-hidden text-sm leading-6 text-zinc-600">
        {note.content || "No details yet. Tap to add some context."}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
