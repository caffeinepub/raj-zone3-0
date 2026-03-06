import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { LeaderboardEntry } from "../backend.d";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";

const sampleLeaderboard: LeaderboardEntry[] = [
  { rank: 1n, playerName: "Rahul Sharma", score: 520n },
  { rank: 2n, playerName: "Ankit Verma", score: 480n },
  { rank: 3n, playerName: "Rajdeep Bhar", score: 420n },
  { rank: 4n, playerName: "Priya Singh", score: 390n },
  { rank: 5n, playerName: "Arjun Das", score: 355n },
  { rank: 6n, playerName: "Kavya Patel", score: 310n },
  { rank: 7n, playerName: "Rohit Kumar", score: 280n },
  { rank: 8n, playerName: "Sneha Roy", score: 245n },
];

type FilterTab = "daily" | "weekly" | "alltime";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
        <Trophy className="w-4 h-4 text-accent" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center">
        <Medal className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-chart-4/20 flex items-center justify-center">
        <Medal className="w-4 h-4 text-chart-4" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
      <span className="font-display font-bold text-sm text-muted-foreground">
        {rank}
      </span>
    </div>
  );
}

export function LeaderboardScreen() {
  const { navigate } = useGame();
  const { actor, isFetching } = useActor();
  const [activeTab, setActiveTab] = useState<FilterTab>("alltime");

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return sampleLeaderboard;
      try {
        const result = await actor.getLeaderboard();
        return result.length > 0 ? result : sampleLeaderboard;
      } catch {
        return sampleLeaderboard;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const displayData = leaderboard ?? sampleLeaderboard;

  const tabs: { key: FilterTab; label: string; ocid: string }[] = [
    { key: "daily", label: "Daily", ocid: "leaderboard.daily.tab" },
    { key: "weekly", label: "Weekly", ocid: "leaderboard.weekly.tab" },
    { key: "alltime", label: "All Time", ocid: "leaderboard.alltime.tab" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh pb-20"
      data-ocid="leaderboard.section"
    >
      <header className="p-4 pt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-9 h-9 rounded-xl game-card flex items-center justify-center hover:border-primary/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-display font-black text-xl text-foreground">
            Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Top academic champions
          </p>
        </div>
      </header>

      {/* Trophy banner */}
      <div className="px-4 mb-4">
        <div className="game-card p-4 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/20 flex items-center gap-4 shadow-card-raise">
          <Trophy className="w-12 h-12 text-accent" />
          <div>
            <p className="font-display font-black text-foreground text-lg">
              Top Scholars
            </p>
            <p className="text-xs text-muted-foreground">
              Compete, learn, and rise to the top!
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              data-ocid={tab.ocid}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="px-4 flex-1 space-y-2" data-ocid="leaderboard.table">
        {isLoading
          ? ["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
              <Skeleton
                key={sk}
                className="h-16 w-full rounded-xl bg-secondary/30"
              />
            ))
          : displayData.slice(0, 10).map((entry, idx) => {
              const rank = Number(entry.rank);
              const isTopThree = rank <= 3;
              return (
                <motion.div
                  key={`entry-${entry.playerName}-${String(entry.rank)}`}
                  data-ocid={`leaderboard.row.${idx + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`game-card p-3 flex items-center gap-3 shadow-card-raise ${
                    isTopThree
                      ? rank === 1
                        ? "border-accent/40 bg-accent/5"
                        : rank === 2
                          ? "border-muted-foreground/30"
                          : "border-chart-4/30"
                      : ""
                  }`}
                >
                  <RankBadge rank={rank} />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-display font-bold text-sm truncate ${isTopThree ? "text-foreground" : "text-foreground/80"}`}
                    >
                      {entry.playerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeTab === "daily"
                        ? "Today"
                        : activeTab === "weekly"
                          ? "This week"
                          : "All time"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-display font-black text-base ${
                        rank === 1
                          ? "text-accent"
                          : rank === 2
                            ? "text-muted-foreground"
                            : rank === 3
                              ? "text-chart-4"
                              : "text-foreground"
                      }`}
                    >
                      {Number(entry.score).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              );
            })}
      </div>

      <BottomNav />
    </div>
  );
}
