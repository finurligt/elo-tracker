import { db } from "@/db";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default async function PlayersPage() {
  const allPlayers = await db.query.players.findMany({
    orderBy: (p, { asc }) => [asc(p.name)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {allPlayers.length === 0
              ? "No players yet"
              : `${allPlayers.length} player${allPlayers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/players/new">
          <Button>New Player</Button>
        </Link>
      </div>

      {allPlayers.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mb-3">No players yet.</p>
              <Link href="/players/new">
                <Button variant="secondary">Add first player</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((player) => (
                <tr key={player.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${player.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {player.name}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
