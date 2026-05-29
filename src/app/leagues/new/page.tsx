import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { LeagueForm } from "@/components/leagues/LeagueForm";
import Link from "next/link";

export default function NewLeaguePage() {
  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/leagues" className="text-sm text-indigo-600 hover:underline">
          ← Back to leagues
        </Link>
        <h1 className="text-2xl font-bold mt-2">New League</h1>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-medium text-gray-900">League details</h2>
        </CardHeader>
        <CardBody>
          <LeagueForm />
        </CardBody>
      </Card>
    </div>
  );
}
