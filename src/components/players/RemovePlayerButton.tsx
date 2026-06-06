"use client";

import { useTransition } from "react";
import { removePlayerFromLeague } from "@/actions/players";
import { Button } from "@/components/ui/Button";

export function RemovePlayerButton({
  leagueId,
  playerId,
  playerName,
}: {
  leagueId: string;
  playerId: string;
  playerName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(`Remove ${playerName} from this league? Their match history will be preserved.`)) return;
    startTransition(() => {
      removePlayerFromLeague(leagueId, playerId);
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={isPending}>
      {isPending ? "…" : "Remove"}
    </Button>
  );
}
