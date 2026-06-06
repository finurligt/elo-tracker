import { db } from "@/db";
import { matches, matchTeams, matchMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate, formatEloChange } from "@/lib/utils";
import { DeleteMatchButton } from "@/components/matches/DeleteMatchButton";

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;

  const allMatches = await db.query.matches.findMany({
    where: eq(matches.leagueId, leagueId),
    with: {
      teams: {
        with: {
          members: {
            with: { player: true },
          },
        },
        orderBy: (t, { asc }) => [asc(t.placement)],
      },
    },
    orderBy: (m, { desc }) => [desc(m.playedAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Match History</h2>
        <Link href={`/leagues/${leagueId}/matches/new`}>
          <Button size="sm">Record match</Button>
        </Link>
      </div>

      {allMatches.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm mb-3">No matches recorded yet.</p>
              <Link href={`/leagues/${leagueId}/matches/new`}>
                <Button variant="secondary" size="sm">Record first match</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {allMatches.map((match, idx) => (
            <Card key={match.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-2">
                      {formatDate(match.playedAt as Date)}
                      {match.notes && <span className="ml-2 italic">— {match.notes}</span>}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {match.teams.map((team) => (
                        <div key={team.id} className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-400 w-5 shrink-0 tabular-nums">
                            #{team.placement}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {team.members.map((member) => (
                              <span key={member.id} className="flex items-center gap-1 text-sm">
                                <Link
                                  href={`/players/${member.playerId}`}
                                  className="font-medium text-gray-900 hover:text-indigo-600"
                                >
                                  {member.player.name}
                                </Link>
                                <span
                                  className={
                                    member.eloChange > 0
                                      ? "text-green-600 text-xs font-medium"
                                      : member.eloChange < 0
                                      ? "text-red-500 text-xs font-medium"
                                      : "text-gray-400 text-xs"
                                  }
                                >
                                  {formatEloChange(member.eloChange)}
                                </span>
                              </span>
                            ))}
                          </div>
                          {team.placement === 1 && (
                            <span className="text-xs text-yellow-600 font-medium">🏆</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <DeleteMatchButton matchId={match.id} isLatest={idx === 0} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
