import { db } from "@/db";
import { players, leaguePlayers, matchMembers, matches, matchTeams, leagues } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { formatDate, formatEloChange } from "@/lib/utils";
import { EditPlayerName } from "@/components/players/EditPlayerName";
import { EloHistoryChart } from "@/components/players/EloHistoryChartWrapper";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;

  const player = await db.query.players.findFirst({
    where: eq(players.id, playerId),
  });
  if (!player) notFound();

  // All league memberships for this player
  const memberships = await db.query.leaguePlayers.findMany({
    where: eq(leaguePlayers.playerId, playerId),
    with: { league: true },
    orderBy: (lp, { desc }) => [desc(lp.elo)],
  });

  // All matches this player participated in
  const memberRecords = await db.query.matchMembers.findMany({
    where: eq(matchMembers.playerId, playerId),
    with: {
      match: {
        with: {
          league: true,
          teams: {
            with: {
              members: {
                with: { player: true },
              },
            },
          },
        },
      },
    },
  });

  // Sort by match date descending, teams by placement ascending
  memberRecords.sort(
    (a, b) =>
      new Date(b.match.playedAt as Date).getTime() -
      new Date(a.match.playedAt as Date).getTime()
  );
  memberRecords.forEach((r) =>
    r.match.teams.sort((a, b) => a.placement - b.placement)
  );

  // Build ELO history chart data (chronological order)
  const chronological = [...memberRecords].reverse();
  const leagueNames = [...new Set(chronological.map((r) => r.match.league.name))];
  const chartData: { date: string; [k: string]: number | string }[] = [];

  for (const record of chronological) {
    const leagueName = record.match.league.name;
    const date = new Date(record.match.playedAt as Date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Add starting point once per league
    if (!chartData.some((p) => p[leagueName] !== undefined)) {
      chartData.push({ date, [leagueName]: record.eloBefore });
    }
    chartData.push({ date, [leagueName]: record.eloAfter });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/players" className="text-sm text-indigo-600 hover:underline">
          ← Players
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <EditPlayerName playerId={player.id} currentName={player.name} />
        </div>
      </div>

      {/* League ratings */}
      {memberships.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">League ratings</h2>
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">League</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">ELO</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">W</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">L</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">D</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/leagues/${m.leagueId}/rankings`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {m.league.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{m.elo}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-green-600">{m.wins}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-500">{m.losses}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{m.draws}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ELO history chart */}
      {memberRecords.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">ELO history</h2>
          <Card>
            <CardBody>
              <EloHistoryChart data={chartData} leagues={leagueNames} />
            </CardBody>
          </Card>
        </div>
      )}

      {/* Match history */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Match history</h2>
        {memberRecords.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-sm text-gray-400 text-center py-6">No matches played yet.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {memberRecords.map((record) => {
              const match = record.match;
              // Find this player's team
              const myTeam = match.teams.find((t) =>
                t.members.some((m) => m.playerId === playerId)
              );
              const placement = myTeam?.placement ?? 0;
              const bestPlacement = Math.min(...match.teams.map((t) => t.placement));
              const isWin = placement === bestPlacement &&
                match.teams.filter((t) => t.placement === bestPlacement).length === 1;
              const isDraw = match.teams.filter((t) => t.placement === placement).length > 1;

              return (
                <Card key={record.id}>
                  <CardBody className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Link
                            href={`/leagues/${match.leagueId}/rankings`}
                            className="text-xs font-medium text-indigo-600 hover:underline"
                          >
                            {match.league.name}
                          </Link>
                          <span className="text-xs text-gray-400">
                            {formatDate(match.playedAt as Date)}
                          </span>
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                              isWin
                                ? "bg-green-100 text-green-700"
                                : isDraw
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isWin ? "Win" : isDraw ? "Draw" : "Loss"}
                          </span>
                        </div>
                        {/* Teams */}
                        <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-0.5">
                          {match.teams.map((team) => (
                            <span key={team.id}>
                              <span className="text-gray-400">#{team.placement} </span>
                              {team.members.map((m) => m.player.name).join(" & ")}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums shrink-0 ${
                          record.eloChange > 0
                            ? "text-green-600"
                            : record.eloChange < 0
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {formatEloChange(record.eloChange)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
