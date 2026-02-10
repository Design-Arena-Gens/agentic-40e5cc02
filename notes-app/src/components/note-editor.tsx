"use client";

import { FormEvent, useState } from "react";

export type NoteDraft = {
  id?: string;
  title: string;
  content: string;
  tags: string[];
};

type NoteEditorProps = {
  initialValue?: NoteDraft;
  onSubmit: (note: NoteDraft) => void;
  onDelete?: () => void;
  onCancel: () => void;
  submitLabel?: string;
};

const createEmptyDraft = (): NoteDraft => ({
  title: "",
  content: "",
  tags: [],
});

function normalizeTag(tag: string) {
  return tag.trim().replace(/\s+/g, "-").toLowerCase();
}

export function NoteEditor({
  initialValue,
  onSubmit,
  onDelete,
  onCancel,
  submitLabel,
}: NoteEditorProps) {
  const [draft, setDraft] = useState<NoteDraft>(
    initialValue ?? createEmptyDraft(),
  );
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = draft.title.trim();
    const trimmedContent = draft.content.trim();

    if (!trimmedTitle && !trimmedContent) {
      return;
    }

    onSubmit({
      ...draft,
      title: trimmedTitle,
      content: trimmedContent,
    });
  };

  const removeTag = (tag: string) => {
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.filter((existing) => existing !== tag),
    }));
  };

  const addTag = () => {
    const normalized = normalizeTag(tagInput);
    if (!normalized || draft.tags.includes(normalized)) {
      setTagInput("");
      return;
    }

    setDraft((prev) => ({
      ...prev,
      tags: [...prev.tags, normalized],
    }));
    setTagInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-zinc-100"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          {submitLabel ?? "Save note"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
        >
          Cancel
        </button>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-600">Title</span>
        <input
          value={draft.title}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, title: event.target.value }))
          }
          placeholder="e.g. Grocery list"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base font-medium text-zinc-900 outline-none ring-0 transition focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/50"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-600">Details</span>
        <textarea
          value={draft.content}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, content: event.target.value }))
          }
          placeholder="Capture the details..."
          rows={6}
          className="resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/50"
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-zinc-600">Tags</span>
        <div className="flex flex-wrap items-center gap-2">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-500 transition hover:text-blue-600"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag"
              className="w-24 bg-transparent text-sm font-medium text-zinc-700 outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-sm font-medium text-blue-500 transition hover:text-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 active:scale-[0.99]"
          >
            Delete note
          </button>
        )}
        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-600 active:scale-[0.99]"
        >
          {submitLabel ?? (draft.id ? "Update note" : "Save note")}
        </button>
      </div>
    </form>
  );
}
