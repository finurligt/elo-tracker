export type TeamInput = {
  teamId: string;
  placement: number; // 1 = winner/1st, 2 = 2nd, etc.
  memberElos: number[]; // current ELO of each member
};

export type TeamResult = {
  teamId: string;
  delta: number; // ELO delta applied to every member of this team
};

export function calculateEloChanges(teams: TeamInput[], kFactor: number): TeamResult[] {
  if (teams.length < 2) throw new Error("Need at least 2 teams");

  const n = teams.length;

  // Team ELO = average of member ELOs
  const teamElos = teams.map((t) => ({
    teamId: t.teamId,
    placement: t.placement,
    elo: t.memberElos.reduce((a, b) => a + b, 0) / t.memberElos.length,
  }));

  const deltas = new Map<string, number>(teams.map((t) => [t.teamId, 0]));

  // Pairwise comparisons across all teams
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = teamElos[i];
      const b = teamElos[j];

      const eA = 1 / (1 + Math.pow(10, (b.elo - a.elo) / 400));
      const eB = 1 - eA;

      let sA: number, sB: number;
      if (a.placement < b.placement) {
        sA = 1.0;
        sB = 0.0;
      } else if (a.placement > b.placement) {
        sA = 0.0;
        sB = 1.0;
      } else {
        sA = 0.5;
        sB = 0.5;
      }

      // K scaled by (n-1) so total change is proportional regardless of team count
      const k = kFactor / (n - 1);
      deltas.set(a.teamId, (deltas.get(a.teamId) ?? 0) + k * (sA - eA));
      deltas.set(b.teamId, (deltas.get(b.teamId) ?? 0) + k * (sB - eB));
    }
  }

  return teams.map((t) => ({
    teamId: t.teamId,
    delta: Math.round(deltas.get(t.teamId) ?? 0),
  }));
}
