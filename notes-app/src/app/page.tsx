"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Note, NoteCard } from "@/components/note-card";
import { NoteDraft, NoteEditor } from "@/components/note-editor";
import { TagFilter } from "@/components/tag-filter";
import { loadNotes, persistNotes } from "@/lib/storage";

function matchesSearch(note: Note, searchTerm: string) {
  if (!searchTerm) return true;
  const value = searchTerm.toLowerCase();
  return (
    note.title.toLowerCase().includes(value) ||
    note.content.toLowerCase().includes(value) ||
    note.tags.some((tag) => tag.toLowerCase().includes(value))
  );
}

function matchesTags(note: Note, activeTags: string[]) {
  if (activeTags.length === 0) return true;
  return activeTags.every((tag) => note.tags.includes(tag));
}

function sortByUpdatedAt(notes: Note[]) {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    const stored = loadNotes();
    hasBootstrapped.current = true;
    startTransition(() => {
      setNotes(sortByUpdatedAt(stored));
    });
  }, []);

  useEffect(() => {
    if (!hasBootstrapped.current) {
      return;
    }
    persistNotes(notes);
  }, [notes]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const trimmed = searchTerm.trim();
    return notes.filter(
      (note) => matchesSearch(note, trimmed) && matchesTags(note, activeTags),
    );
  }, [notes, searchTerm, activeTags]);

  const openNewEditor = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const openExistingNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleSave = (draft: NoteDraft) => {
    setNotes((current) => {
      if (draft.id) {
        const nextNotes = current.map((note) =>
          note.id === draft.id
            ? {
                ...note,
                title: draft.title,
                content: draft.content,
                tags: draft.tags,
                updatedAt: new Date().toISOString(),
              }
            : note,
        );
        return sortByUpdatedAt(nextNotes);
      }

      const now = new Date().toISOString();
      const newNote: Note = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        title: draft.title,
        content: draft.content,
        tags: draft.tags,
        createdAt: now,
        updatedAt: now,
      };
      return sortByUpdatedAt([newNote, ...current]);
    });
    closeEditor();
  };

  const handleDelete = () => {
    if (!editingNote) return;
    setNotes((current) =>
      current.filter((note) => note.id !== editingNote.id),
    );
    closeEditor();
  };

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    );
  };

  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-br from-zinc-100 via-white to-blue-50 px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-xl flex-col gap-6 pb-20">
        <header className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Pocket Notes
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Quick thoughts, captured anywhere.
              </h1>
            </div>
            <button
              onClick={openNewEditor}
              className="hidden h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white shadow-lg transition hover:bg-blue-600 active:scale-95 sm:flex"
              aria-label="Create note"
            >
              +
            </button>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 ring-0 transition focus-within:border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/40">
            <span className="text-zinc-400">🔍</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="search"
              placeholder="Search notes, tags, keywords..."
              className="w-full bg-transparent text-sm font-medium text-zinc-700 outline-none"
            />
          </label>
          <TagFilter tags={allTags} active={activeTags} onToggle={toggleTag} />
        </header>

        <section className="flex flex-col gap-4">
          {filteredNotes.length === 0 && notes.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-zinc-100">
              <span className="text-5xl">🗒️</span>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Create your first note
                </h2>
                <p className="text-sm text-zinc-500">
                  Capture ideas, todos, and memories. Add tags to organize
                  everything and find them instantly with search.
                </p>
              </div>
              <button
                onClick={openNewEditor}
                className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-600 active:scale-[0.99]"
              >
                Start writing
              </button>
            </div>
          )}

          {filteredNotes.length === 0 && notes.length > 0 && (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-zinc-500 shadow ring-1 ring-zinc-100">
              Couldn&apos;t find any notes. Try another search or deselect some
              tags.
            </div>
          )}

          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={editingNote?.id === note.id && isEditorOpen}
              onSelect={openExistingNote}
            />
          ))}
        </section>
      </div>

      <button
        onClick={openNewEditor}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold text-white shadow-xl transition hover:bg-blue-600 active:scale-95 sm:hidden"
        aria-label="Create note"
      >
        +
      </button>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-4 sm:items-center sm:pb-0">
          <div className="w-full max-w-lg animate-[slide-up_0.25s_ease-out] pb-4 sm:pb-0">
            <NoteEditor
              key={editingNote?.id ?? "create"}
              initialValue={
                editingNote
                  ? {
                      id: editingNote.id,
                      title: editingNote.title,
                      content: editingNote.content,
                      tags: editingNote.tags,
                    }
                  : undefined
              }
              onSubmit={handleSave}
              onDelete={editingNote ? handleDelete : undefined}
              onCancel={closeEditor}
              submitLabel={editingNote ? "Update note" : "Save note"}
            />
          </div>
        </div>
      )}
    </main>
  );
}
