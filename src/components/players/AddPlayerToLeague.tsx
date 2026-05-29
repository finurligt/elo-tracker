"use client";

import { useState, useEffect, useTransition } from "react";
import { addPlayerToLeague } from "@/actions/players";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type Player = { id: string; name: string };

export function AddPlayerToLeague({
  leagueId,
  availablePlayers,
}: {
  leagueId: string;
  availablePlayers: Player[];
}) {
  const [selectedId, setSelectedId] = useState(availablePlayers[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // After a player is added, the list shrinks — reset selection to the new first player
  useEffect(() => {
    if (!availablePlayers.find((p) => p.id === selectedId)) {
      setSelectedId(availablePlayers[0]?.id ?? "");
    }
  }, [availablePlayers]);

  function handleAdd() {
    if (!selectedId) return;
    setError(null);
    startTransition(async () => {
      const result = await addPlayerToLeague(leagueId, selectedId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex gap-2 items-end">
      <Select
        label="Select player"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="flex-1 max-w-xs"
      >
        {availablePlayers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Button onClick={handleAdd} disabled={isPending || !selectedId}>
        {isPending ? "Adding…" : "Add to league"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
