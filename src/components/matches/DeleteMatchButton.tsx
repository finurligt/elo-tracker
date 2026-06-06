"use client";

import { useTransition } from "react";
import { deleteMatch } from "@/actions/matches";
import { Button } from "@/components/ui/Button";

export function DeleteMatchButton({
  matchId,
  isLatest,
}: {
  matchId: string;
  isLatest: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const message = isLatest
      ? "Undo this match? ELO changes will be reverted."
      : "⚠️ This is not the latest match. Undoing it will revert its ELO changes but won't fix later matches that were calculated on top of it. Continue?";

    if (!confirm(message)) return;
    startTransition(() => {
      deleteMatch(matchId);
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? "…" : "Undo"}
    </Button>
  );
}
