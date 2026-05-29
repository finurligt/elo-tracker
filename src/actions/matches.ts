"use server";

import { db } from "@/db";
import { matches, matchTeams, matchMembers, leaguePlayers, leagues } from "@/db/schema";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";
import { calculateEloChanges } from "@/lib/elo";

export type TeamInput = {
  placement: number;
  playerIds: string[];
};

function getOutcome(
  teamPlacement: number,
  allPlacements: number[]
): { isWin: boolean; isDraw: boolean; isLoss: boolean } {
  const othersWithSamePlacement = allPlacements.filter((p) => p === teamPlacement).length > 1;
  const bestPlacement = Math.min(...allPlacements);
  const isWin = teamPlacement === bestPlacement && !othersWithSamePlacement;
  const isDraw = othersWithSamePlacement;
  const isLoss = !isWin && !isDraw;
  return { isWin, isDraw, isLoss };
}

export async function recordMatch(
  leagueId: string,
  teams: TeamInput[],
  notes?: string
) {
  const league = await db.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
  });
  if (!league) return { error: "League not found" };

  const allPlayerIds = teams.flatMap((t) => t.playerIds);
  if (new Set(allPlayerIds).size !== allPlayerIds.length) {
    return { error: "A player cannot appear in multiple teams" };
  }

  const memberships = await db.query.leaguePlayers.findMany({
    where: and(
      eq(leaguePlayers.leagueId, leagueId),
      inArray(leaguePlayers.playerId, allPlayerIds)
    ),
  });

  const eloMap = new Map(memberships.map((m) => [m.playerId, m.elo]));
  const membershipMap = new Map(memberships.map((m) => [m.playerId, m]));

  for (const pid of allPlayerIds) {
    if (!eloMap.has(pid)) {
      return { error: `Player ${pid} is not in this league` };
    }
  }

  const teamInputs = teams.map((t, i) => ({
    teamId: `team-${i}`,
    placement: t.placement,
    memberElos: t.playerIds.map((pid) => eloMap.get(pid)!),
  }));

  const eloResults = calculateEloChanges(teamInputs, league.kFactor);
  const deltaMap = new Map(eloResults.map((r) => [r.teamId, r.delta]));
  const allPlacements = teams.map((t) => t.placement);

  const matchId = nanoid();
  await db.insert(matches).values({
    id: matchId,
    leagueId,
    notes: notes?.trim() || null,
  });

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const teamId = nanoid();
    const delta = deltaMap.get(`team-${i}`) ?? 0;
    const { isWin, isDraw, isLoss } = getOutcome(team.placement, allPlacements);

    await db.insert(matchTeams).values({
      id: teamId,
      matchId,
      placement: team.placement,
    });

    for (const playerId of team.playerIds) {
      const eloBefore = eloMap.get(playerId)!;
      const eloAfter = eloBefore + delta;
      const membership = membershipMap.get(playerId)!;

      await db.insert(matchMembers).values({
        id: nanoid(),
        matchTeamId: teamId,
        matchId,
        playerId,
        eloBefore,
        eloAfter,
        eloChange: delta,
      });

      await db
        .update(leaguePlayers)
        .set({
          elo: eloAfter,
          wins: membership.wins + (isWin ? 1 : 0),
          losses: membership.losses + (isLoss ? 1 : 0),
          draws: membership.draws + (isDraw ? 1 : 0),
          gamesPlayed: membership.gamesPlayed + 1,
        })
        .where(
          and(
            eq(leaguePlayers.leagueId, leagueId),
            eq(leaguePlayers.playerId, playerId)
          )
        );
    }
  }

  revalidatePath(`/leagues/${leagueId}/rankings`);
  revalidatePath(`/leagues/${leagueId}/matches`);

  return { matchId };
}

export async function deleteMatch(matchId: string) {
  const members = await db.query.matchMembers.findMany({
    where: eq(matchMembers.matchId, matchId),
  });

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });
  if (!match) return { error: "Match not found" };

  // Load all teams for this match to determine outcomes
  const teams = await db.query.matchTeams.findMany({
    where: eq(matchTeams.matchId, matchId),
  });
  const allPlacements = teams.map((t) => t.placement);

  // Build a map from matchTeamId -> placement
  const teamPlacementMap = new Map(teams.map((t) => [t.id, t.placement]));

  // Build a map from playerId -> matchTeamId
  const playerTeamMap = new Map(members.map((m) => [m.playerId, m.matchTeamId]));

  for (const member of members) {
    const lp = await db.query.leaguePlayers.findFirst({
      where: and(
        eq(leaguePlayers.leagueId, match.leagueId),
        eq(leaguePlayers.playerId, member.playerId)
      ),
    });
    if (!lp) continue;

    const teamId = playerTeamMap.get(member.playerId)!;
    const placement = teamPlacementMap.get(teamId)!;
    const { isWin, isDraw, isLoss } = getOutcome(placement, allPlacements);

    await db
      .update(leaguePlayers)
      .set({
        elo: member.eloBefore,
        wins: Math.max(0, lp.wins - (isWin ? 1 : 0)),
        losses: Math.max(0, lp.losses - (isLoss ? 1 : 0)),
        draws: Math.max(0, lp.draws - (isDraw ? 1 : 0)),
        gamesPlayed: Math.max(0, lp.gamesPlayed - 1),
      })
      .where(
        and(
          eq(leaguePlayers.leagueId, match.leagueId),
          eq(leaguePlayers.playerId, member.playerId)
        )
      );
  }

  await db.delete(matches).where(eq(matches.id, matchId));

  revalidatePath(`/leagues/${match.leagueId}/rankings`);
  revalidatePath(`/leagues/${match.leagueId}/matches`);
}
