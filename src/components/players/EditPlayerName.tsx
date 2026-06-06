"use client";

import { useState, useTransition } from "react";
import { updatePlayer } from "@/actions/players";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EditPlayerName({
  playerId,
  currentName,
}: {
  playerId: string;
  currentName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim() || name.trim() === currentName) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await updatePlayer(playerId, name.trim());
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-400 hover:text-gray-600 ml-2"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") { setName(currentName); setEditing(false); }
        }}
        autoFocus
        className="text-sm"
      />
      <Button size="sm" onClick={handleSave} disabled={isPending}>
        {isPending ? "…" : "Save"}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => { setName(currentName); setEditing(false); }}>
        Cancel
      </Button>
    </div>
  );
}
