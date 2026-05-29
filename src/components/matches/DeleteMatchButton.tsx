"use client";

import { useTransition } from "react";
import { deleteMatch } from "@/actions/matches";
import { Button } from "@/components/ui/Button";

export function DeleteMatchButton({ matchId }: { matchId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Undo this match? ELO changes will be reverted.")) return;
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
