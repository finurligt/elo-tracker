import { db } from "@/db";
import { leagues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LeagueSubNav } from "@/components/layout/LeagueSubNav";
import Link from "next/link";

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const league = await db.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
  });

  if (!league) notFound();

  return (
    <div className="-mt-8 -mx-4">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/leagues" className="text-xs text-indigo-600 hover:underline">
            ← Leagues
          </Link>
          <div className="flex items-start justify-between gap-2 mt-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{league.name}</h1>
              {league.description && (
                <p className="text-sm text-gray-500 mt-0.5">{league.description}</p>
              )}
            </div>
            <Link
              href={`/leagues/${leagueId}/edit`}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1 shrink-0"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>
      <LeagueSubNav leagueId={leagueId} />
      <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
