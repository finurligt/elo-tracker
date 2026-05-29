import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const leagues = sqliteTable("leagues", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  matchType: text("match_type", { enum: ["ffa", "team"] })
    .notNull()
    .default("ffa"),
  kFactor: integer("k_factor").notNull().default(32),
  startingElo: integer("starting_elo").notNull().default(1000),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const leaguePlayers = sqliteTable("league_players", {
  id: text("id").primaryKey(),
  leagueId: text("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  elo: integer("elo").notNull().default(1000),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  leagueId: text("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  playedAt: integer("played_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  notes: text("notes"),
});

export const matchTeams = sqliteTable("match_teams", {
  id: text("id").primaryKey(),
  matchId: text("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  placement: integer("placement").notNull(),
});

export const matchMembers = sqliteTable("match_members", {
  id: text("id").primaryKey(),
  matchTeamId: text("match_team_id")
    .notNull()
    .references(() => matchTeams.id, { onDelete: "cascade" }),
  matchId: text("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  eloBefore: integer("elo_before").notNull(),
  eloAfter: integer("elo_after").notNull(),
  eloChange: integer("elo_change").notNull(),
});

// Relations for Drizzle relational queries
export const playersRelations = relations(players, ({ many }) => ({
  leagueMemberships: many(leaguePlayers),
  matchMembers: many(matchMembers),
}));

export const leaguesRelations = relations(leagues, ({ many }) => ({
  leaguePlayers: many(leaguePlayers),
  matches: many(matches),
}));

export const leaguePlayersRelations = relations(leaguePlayers, ({ one }) => ({
  league: one(leagues, { fields: [leaguePlayers.leagueId], references: [leagues.id] }),
  player: one(players, { fields: [leaguePlayers.playerId], references: [players.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  league: one(leagues, { fields: [matches.leagueId], references: [leagues.id] }),
  teams: many(matchTeams),
  members: many(matchMembers),
}));

export const matchTeamsRelations = relations(matchTeams, ({ one, many }) => ({
  match: one(matches, { fields: [matchTeams.matchId], references: [matches.id] }),
  members: many(matchMembers),
}));

export const matchMembersRelations = relations(matchMembers, ({ one }) => ({
  match: one(matches, { fields: [matchMembers.matchId], references: [matches.id] }),
  team: one(matchTeams, { fields: [matchMembers.matchTeamId], references: [matchTeams.id] }),
  player: one(players, { fields: [matchMembers.playerId], references: [players.id] }),
}));
