import { db } from "@/db";
import { leaguePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function RankingsPage({
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Rankings</h2>
        <Link href={`/leagues/${leagueId}/matches/new`}>
          <Button size="sm">Record match</Button>
        </Link>
      </div>

      {members.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-3">No players in this league yet.</p>
            <Link href={`/leagues/${leagueId}/players`}>
              <Button variant="secondary" size="sm">Add players</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Player</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">ELO</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">W</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">L</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">D</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">GP</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${member.playerId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {member.player.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">
                    {member.elo}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-green-600">{member.wins}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-500">{member.losses}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">{member.draws}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400">{member.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
