"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createPlayer } from "@/actions/players";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PlayerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createPlayer(formData);
      if (!result?.error) {
        router.push("/players");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="name" name="name" label="Name" placeholder="e.g. Alice" required />
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create player"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/players")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
