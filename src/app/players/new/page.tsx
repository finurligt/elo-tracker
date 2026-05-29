import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PlayerForm } from "@/components/players/PlayerForm";
import Link from "next/link";

export default function NewPlayerPage() {
  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/players" className="text-sm text-indigo-600 hover:underline">
          ← Back to players
        </Link>
        <h1 className="text-2xl font-bold mt-2">New Player</h1>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-medium text-gray-900">Player details</h2>
        </CardHeader>
        <CardBody>
          <PlayerForm />
        </CardBody>
      </Card>
    </div>
  );
}
