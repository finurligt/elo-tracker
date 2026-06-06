import { db } from "@/db";
import { leagues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { EditLeagueForm } from "@/components/leagues/EditLeagueForm";

export default async function EditLeaguePage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const league = await db.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
  });
  if (!league) notFound();

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <Link
          href={`/leagues/${leagueId}/rankings`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to league
        </Link>
        <h2 className="text-lg font-semibold mt-1">Edit league</h2>
      </div>
      <Card>
        <CardHeader>
          <h3 className="font-medium text-gray-900">League details</h3>
        </CardHeader>
        <CardBody>
          <EditLeagueForm league={league} />
        </CardBody>
      </Card>
    </div>
  );
}
