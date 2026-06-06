"use server";

import { db } from "@/db";
import { leagues } from "@/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createLeague(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const matchType = (formData.get("matchType") as "ffa" | "team") || "ffa";
  const kFactor = parseInt((formData.get("kFactor") as string) || "32", 10);
  const startingElo = parseInt((formData.get("startingElo") as string) || "1000", 10);

  if (!name?.trim()) return { error: "Name is required" };

  await db.insert(leagues).values({
    id: nanoid(),
    name: name.trim(),
    description: description?.trim() || null,
    matchType,
    kFactor,
    startingElo,
  });

  revalidatePath("/leagues");
}

export async function updateLeague(leagueId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const kFactor = parseInt((formData.get("kFactor") as string) || "32", 10);

  if (!name?.trim()) return { error: "Name is required" };

  await db
    .update(leagues)
    .set({
      name: name.trim(),
      description: description?.trim() || null,
      kFactor,
    })
    .where(eq(leagues.id, leagueId));

  revalidatePath("/leagues");
  revalidatePath(`/leagues/${leagueId}`);
}

export async function deleteLeague(leagueId: string) {
  await db.delete(leagues).where(eq(leagues.id, leagueId));
  revalidatePath("/leagues");
}
