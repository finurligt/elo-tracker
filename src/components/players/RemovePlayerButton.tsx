"use client";

import { useTransition } from "react";
import { removePlayerFromLeague } from "@/actions/players";
import { Button } from "@/components/ui/Button";

export function RemovePlayerButton({
  leagueId,
  playerId,
}: {
  leagueId: string;
  playerId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
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
