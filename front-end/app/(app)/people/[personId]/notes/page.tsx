"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type Note = {
  id: string;
  author: string;
  date: string;
  text: string;
};

const initialNotes: Note[] = [
  { id: "n1", author: "Admin", date: "—", text: "Sample note." },
];

export default function NotesPage() {
  const params = useParams();
  const personIdParam = params.personId;
  const personId = Array.isArray(personIdParam)
    ? personIdParam[0]
    : (personIdParam ?? "");
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [text, setText] = useState("");

  function addNote() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const next: Note = {
      id: String(Date.now()),
      author: "You",
      date: "—",
      text: trimmed,
    };

    setNotes((prev) => [next, ...prev]);
    setText("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Notes</div>
          <h1 className="text-2xl font-semibold">Person {personId}</h1>
        </div>
        <Link
          href={`/people/${personId}`}
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back to profile
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold">Add note</div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Type a note (follow-up, prayer, etc.)"
          />
          <button
            type="button"
            onClick={addNote}
            className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Add
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border border-zinc-200 p-3">
              <div className="text-xs text-zinc-500">
                {n.author} • {n.date}
              </div>
              <div className="mt-1 text-sm">{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
