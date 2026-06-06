import { db } from "@/db";
import { leaguePlayers, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/Card";
import { AddPlayerToLeague } from "@/components/players/AddPlayerToLeague";
import { RemovePlayerButton } from "@/components/players/RemovePlayerButton";

export default async function LeaguePlayersPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;

  const members = await db.query.leaguePlayers.findMany({
    where: eq(leaguePlayers.leagueId, leagueId),
    with: { player: true },
    orderBy: (lp, { desc }) => [desc(lp.elo)],
  });

  const memberIds = new Set(members.map((m) => m.playerId));
  const allPlayers = await db.query.players.findMany({
    orderBy: (p, { asc }) => [asc(p.name)],
  });
  const availablePlayers = allPlayers.filter((p) => !memberIds.has(p.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Players in this league</h2>
        </div>
        <Card>
          {members.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">No players yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Player</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">ELO</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">GP</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{member.player.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{member.elo}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{member.gamesPlayed}</td>
                    <td className="px-4 py-3 text-right">
                      <RemovePlayerButton leagueId={leagueId} playerId={member.playerId} playerName={member.player.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {availablePlayers.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Add player</h2>
          <AddPlayerToLeague leagueId={leagueId} availablePlayers={availablePlayers} />
        </div>
      )}
    </div>
  );
}
