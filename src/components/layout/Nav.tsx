import Link from "next/link";

export function Nav() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/leagues" className="font-bold text-lg text-indigo-600 tracking-tight">
          ELO Tracker
        </Link>
        <nav className="flex gap-1">
          <Link
            href="/leagues"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Leagues
          </Link>
          <Link
            href="/players"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Players
          </Link>
        </nav>
      </div>
    </header>
  );
}
