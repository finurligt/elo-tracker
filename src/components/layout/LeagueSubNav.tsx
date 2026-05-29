"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LeagueSubNav({ leagueId }: { leagueId: string }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Rankings", href: `/leagues/${leagueId}/rankings` },
    { label: "Matches", href: `/leagues/${leagueId}/matches` },
    { label: "Players", href: `/leagues/${leagueId}/players` },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                pathname === tab.href
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
