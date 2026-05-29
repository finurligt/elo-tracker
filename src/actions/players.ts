"use server";

import { db } from "@/db";
import { players, leaguePlayers, leagues } from "@/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createPlayer(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Name is required" };

  await db.insert(players).values({
    id: nanoid(),
    name: name.trim(),
  });

  revalidatePath("/players");
}

export async function addPlayerToLeague(leagueId: string, playerId: string) {
  const league = await db.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
  });
  if (!league) return { error: "League not found" };

  const existing = await db.query.leaguePlayers.findFirst({
    where: and(
      eq(leaguePlayers.leagueId, leagueId),
      eq(leaguePlayers.playerId, playerId)
    ),
  });
  if (existing) return { error: "Player already in league" };

  await db.insert(leaguePlayers).values({
    id: nanoid(),
    leagueId,
    playerId,
    elo: league.startingElo,
  });

  revalidatePath(`/leagues/${leagueId}/players`);
  revalidatePath(`/leagues/${leagueId}/rankings`);
}

export async function removePlayerFromLeague(leagueId: string, playerId: string) {
  await db
    .delete(leaguePlayers)
    .where(
      and(
        eq(leaguePlayers.leagueId, leagueId),
        eq(leaguePlayers.playerId, playerId)
      )
    );

  revalidatePath(`/leagues/${leagueId}/players`);
  revalidatePath(`/leagues/${leagueId}/rankings`);
}
