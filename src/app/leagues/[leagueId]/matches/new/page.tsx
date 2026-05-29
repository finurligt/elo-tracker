import { db } from "@/db";
import { leagues, leaguePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { MatchForm } from "@/components/matches/MatchForm";

export default async function NewMatchPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;

  const league = await db.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
  });
  if (!league) notFound();

  const members = await db.query.leaguePlayers.findMany({
    where: eq(leaguePlayers.leagueId, leagueId),
    with: { player: true },
  });

  const leaguePlayers2 = members
    .map((m) => ({ id: m.playerId, name: m.player.name, elo: m.elo }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Link
          href={`/leagues/${leagueId}/matches`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to matches
        </Link>
        <h2 className="text-lg font-semibold mt-1">Record a match</h2>
      </div>

      {leaguePlayers2.length < 2 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">
              You need at least 2 players in this league to record a match.{" "}
              <Link href={`/leagues/${leagueId}/players`} className="text-indigo-600 hover:underline">
                Add players
              </Link>
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-900">Match details</h3>
          </CardHeader>
          <CardBody>
            <MatchForm
              leagueId={leagueId}
              matchType={league.matchType}
              availablePlayers={leaguePlayers2}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
