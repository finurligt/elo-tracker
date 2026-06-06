"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateLeague } from "@/actions/leagues";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type League = {
  id: string;
  name: string;
  description: string | null;
  kFactor: number;
};

export function EditLeagueForm({ league }: { league: League }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateLeague(league.id, formData);
      if (!result?.error) {
        router.push(`/leagues/${league.id}/rankings`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        name="name"
        label="Name"
        defaultValue={league.name}
        required
      />
      <Textarea
        id="description"
        name="description"
        label="Description (optional)"
        defaultValue={league.description ?? ""}
        rows={2}
      />
      <Input
        id="kFactor"
        name="kFactor"
        label="K-factor"
        type="number"
        defaultValue={league.kFactor}
        min={1}
        max={128}
      />
      <p className="text-xs text-gray-400">
        Note: changing the K-factor only affects future matches.
      </p>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/leagues/${league.id}/rankings`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
