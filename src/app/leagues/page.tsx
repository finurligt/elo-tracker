import { db } from "@/db";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function LeaguesPage() {
  const allLeagues = await db.query.leagues.findMany({
    orderBy: (l, { desc }) => [desc(l.createdAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leagues</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {allLeagues.length === 0 ? "No leagues yet" : `${allLeagues.length} league${allLeagues.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/leagues/new">
          <Button>New League</Button>
        </Link>
      </div>

      {allLeagues.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mb-3">No leagues yet.</p>
              <Link href="/leagues/new">
                <Button variant="secondary">Create your first league</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {allLeagues.map((league) => (
            <Link key={league.id} href={`/leagues/${league.id}/rankings`}>
              <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-gray-900">{league.name}</h2>
                      {league.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {league.description}
                        </p>
                      )}
                    </div>
                    <Badge color={league.matchType === "team" ? "indigo" : "gray"}>
                      {league.matchType === "team" ? "Team" : "FFA"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Created {formatDate(league.createdAt as Date)}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
