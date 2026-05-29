"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordMatch } from "@/actions/matches";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

type Player = { id: string; name: string; elo: number };

type Team = {
  placement: number;
  playerIds: string[];
};

export function MatchForm({
  leagueId,
  matchType,
  availablePlayers,
}: {
  leagueId: string;
  matchType: "ffa" | "team";
  availablePlayers: Player[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [teams, setTeams] = useState<Team[]>(
    matchType === "ffa"
      ? availablePlayers.slice(0, 2).map((p, i) => ({
          placement: i + 1,
          playerIds: [p.id],
        }))
      : [
          { placement: 1, playerIds: [availablePlayers[0].id] },
          { placement: 2, playerIds: [availablePlayers[1].id] },
        ]
  );

  const usedPlayerIds = new Set(teams.flatMap((t) => t.playerIds));

  function addFfaPlayer() {
    const unused = availablePlayers.find((p) => !usedPlayerIds.has(p.id));
    if (!unused) return;
    setTeams((prev) => [
      ...prev,
      { placement: prev.length + 1, playerIds: [unused.id] },
    ]);
  }

  function removeFfaPlayer(idx: number) {
    setTeams((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((t, i) => ({ ...t, placement: i + 1 }));
    });
  }

  function setFfaPlayer(teamIdx: number, playerId: string) {
    setTeams((prev) =>
      prev.map((t, i) => (i === teamIdx ? { ...t, playerIds: [playerId] } : t))
    );
  }

  function setFfaPlacement(teamIdx: number, placement: number) {
    setTeams((prev) =>
      prev.map((t, i) => (i === teamIdx ? { ...t, placement } : t))
    );
  }

  // Team mode helpers
  function addTeam() {
    const usedInTeams = new Set(teams.flatMap((t) => t.playerIds));
    const unused = availablePlayers.find((p) => !usedInTeams.has(p.id));
    if (!unused) return;
    setTeams((prev) => [
      ...prev,
      { placement: prev.length + 1, playerIds: [unused.id] },
    ]);
  }

  function removeTeam(teamIdx: number) {
    setTeams((prev) => {
      const next = prev.filter((_, i) => i !== teamIdx);
      return next.map((t, i) => ({ ...t, placement: i + 1 }));
    });
  }

  function addPlayerToTeam(teamIdx: number) {
    const usedInTeams = new Set(teams.flatMap((t) => t.playerIds));
    const unused = availablePlayers.find((p) => !usedInTeams.has(p.id));
    if (!unused) return;
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx ? { ...t, playerIds: [...t.playerIds, unused.id] } : t
      )
    );
  }

  function removePlayerFromTeam(teamIdx: number, playerIdx: number) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx
          ? { ...t, playerIds: t.playerIds.filter((_, pi) => pi !== playerIdx) }
          : t
      )
    );
  }

  function setTeamPlayer(teamIdx: number, playerIdx: number, playerId: string) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx
          ? {
              ...t,
              playerIds: t.playerIds.map((pid, pi) => (pi === playerIdx ? playerId : pid)),
            }
          : t
      )
    );
  }

  function setTeamPlacement(teamIdx: number, placement: number) {
    setTeams((prev) =>
      prev.map((t, i) => (i === teamIdx ? { ...t, placement } : t))
    );
  }

  function handleSubmit() {
    setError(null);

    // Validate
    for (const team of teams) {
      if (team.playerIds.length === 0) {
        setError("Each team must have at least one player.");
        return;
      }
    }
    const allPids = teams.flatMap((t) => t.playerIds);
    if (new Set(allPids).size !== allPids.length) {
      setError("A player cannot appear more than once.");
      return;
    }

    startTransition(async () => {
      const result = await recordMatch(leagueId, teams, notes);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(`/leagues/${leagueId}/matches`);
      }
    });
  }

  if (matchType === "ffa") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">
          Assign each player a placement (1 = winner). Tied placements count as draws.
        </p>

        <div className="flex flex-col gap-2">
          {teams.map((team, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={team.placement}
                onChange={(e) => setFfaPlacement(idx, parseInt(e.target.value) || 1)}
                className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded-lg text-center font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Placement"
              />
              <Select
                value={team.playerIds[0]}
                onChange={(e) => setFfaPlayer(idx, e.target.value)}
                className="flex-1"
              >
                {availablePlayers.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={usedPlayerIds.has(p.id) && !team.playerIds.includes(p.id)}
                  >
                    {p.name} ({p.elo})
                  </option>
                ))}
              </Select>
              {teams.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => removeFfaPlayer(idx)}>
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>

        {usedPlayerIds.size < availablePlayers.length && (
          <Button variant="secondary" size="sm" onClick={addFfaPlayer} className="self-start">
            + Add player
          </Button>
        )}

        <Input
          label="Notes (optional)"
          placeholder="e.g. overtime, rematch…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : "Record match"}
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Team mode
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        Build teams and set placements (1 = winner). Unequal team sizes are allowed.
      </p>

      <div className="flex flex-col gap-3">
        {teams.map((team, teamIdx) => {
          const usedInOtherTeams = new Set(
            teams.flatMap((t, i) => (i === teamIdx ? [] : t.playerIds))
          );
          return (
            <div key={teamIdx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500">Placement</span>
                <input
                  type="number"
                  min={1}
                  value={team.placement}
                  onChange={(e) => setTeamPlacement(teamIdx, parseInt(e.target.value) || 1)}
                  className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {teams.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeam(teamIdx)}
                    className="ml-auto text-red-500"
                  >
                    Remove team
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {team.playerIds.map((pid, playerIdx) => (
                  <div key={playerIdx} className="flex items-center gap-2">
                    <Select
                      value={pid}
                      onChange={(e) => setTeamPlayer(teamIdx, playerIdx, e.target.value)}
                      className="flex-1"
                    >
                      {availablePlayers.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={usedInOtherTeams.has(p.id) || (team.playerIds.includes(p.id) && p.id !== pid)}
                        >
                          {p.name} ({p.elo})
                        </option>
                      ))}
                    </Select>
                    {team.playerIds.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayerFromTeam(teamIdx, playerIdx)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {team.playerIds.length < availablePlayers.length - teams.reduce((a, t, i) => a + (i !== teamIdx ? t.playerIds.length : 0), 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addPlayerToTeam(teamIdx)}
                  className="mt-2 text-indigo-600"
                >
                  + Add player to team
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {teams.reduce((a, t) => a + t.playerIds.length, 0) < availablePlayers.length && (
        <Button variant="secondary" size="sm" onClick={addTeam} className="self-start">
          + Add team
        </Button>
      )}

      <Input
        label="Notes (optional)"
        placeholder="e.g. tournament round 1…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Saving…" : "Record match"}
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
