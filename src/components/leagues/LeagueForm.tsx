"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createLeague } from "@/actions/leagues";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function LeagueForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createLeague(formData);
      if (!result?.error) {
        router.push("/leagues");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="name" name="name" label="Name" placeholder="e.g. Beer Pong Season 1" required />
      <Textarea
        id="description"
        name="description"
        label="Description (optional)"
        placeholder="What's this league about?"
        rows={2}
      />
      <Select id="matchType" name="matchType" label="Match type">
        <option value="ffa">Free-for-all / Individual</option>
        <option value="team">Team-based</option>
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="startingElo"
          name="startingElo"
          label="Starting ELO"
          type="number"
          defaultValue={1000}
          min={100}
          max={9999}
        />
        <Input
          id="kFactor"
          name="kFactor"
          label="K-factor"
          type="number"
          defaultValue={32}
          min={1}
          max={128}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create league"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/leagues")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
