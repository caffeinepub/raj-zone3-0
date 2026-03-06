import {
  BookOpen,
  Gamepad2,
  Medal,
  Star,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const actionButtons = [
  {
    id: "start_game",
    ocid: "home.start_game.button",
    label: "Start Game",
    icon: Gamepad2,
    color: "from-primary to-accent",
    shadowColor: "shadow-game-glow",
    screen: "categories" as const,
    desc: "Pick a category & play",
  },
  {
    id: "categories",
    ocid: "home.categories.button",
    label: "Categories",
    icon: BookOpen,
    color: "from-chart-3 to-chart-2",
    shadowColor: "",
    screen: "categories" as const,
    desc: "Browse all subjects",
  },
  {
    id: "leaderboard",
    ocid: "home.leaderboard.button",
    label: "Leaderboard",
    icon: Trophy,
    color: "from-chart-4 to-chart-1",
    shadowColor: "",
    screen: "leaderboard" as const,
    desc: "Top players worldwide",
  },
  {
    id: "daily_challenge",
    ocid: "home.daily_challenge.button",
    label: "Daily Challenge",
    icon: Target,
    color: "from-chart-5 to-destructive",
    shadowColor: "",
    screen: "categories" as const,
    desc: "Today's special quiz",
  },
  {
    id: "profile",
    ocid: "home.profile.button",
    label: "Profile",
    icon: User,
    color: "from-chart-2 to-chart-3",
    shadowColor: "",
    screen: "profile" as const,
    desc: "Stats & achievements",
  },
  {
    id: "tournament",
    ocid: "home.start_game.button",
    label: "🏆 Tournament",
    icon: Medal,
    color: "from-accent to-primary",
    shadowColor: "shadow-game-glow",
    screen: "tournament" as const,
    desc: "Weekly challenge ₹10",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function HomeScreen() {
  const { navigate, profile, setProfile } = useGame();
  const { actor, isFetching } = useActor();
  const { clear, identity } = useInternetIdentity();

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .getCallerUserProfile()
      .then((p) => {
        if (p) setProfile(p);
      })
      .catch(() => {});
  }, [actor, isFetching, setProfile]);

  const displayName = profile?.name ?? (identity ? "Player" : "Guest");
  const totalScore = profile ? Number(profile.totalScore) : 340;
  const level = profile ? Number(profile.currentLevel) : 1;

  const handleLogout = () => {
    clear();
    toast.info("Logged out successfully");
    navigate("auth");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh pb-20"
      data-ocid="home.section"
    >
      {/* Header */}
      <header className="p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-lg overflow-hidden glow-primary">
              <img
                src="/assets/generated/raj-zone-logo-transparent.dim_200x200.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-lg font-black text-foreground ml-1">
              Raj<span className="text-primary">_zone</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="game-card p-4 shadow-card-raise relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 pointer-events-none" />

          <div className="flex items-center gap-4 relative">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-black text-lg shadow-game-glow flex-shrink-0">
              {getInitials(displayName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-foreground text-lg leading-tight truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-foreground/80 font-semibold">
                    {totalScore}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3 text-primary fill-primary" />
                  Lvl{" "}
                  <span className="text-foreground/80 font-semibold">
                    {level}
                  </span>
                </span>
              </div>
            </div>

            {/* Rank badge */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-display font-black text-accent text-sm">
                #12
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                Rank
              </span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Action buttons grid */}
      <main className="flex-1 px-4 py-2">
        <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest mb-4">
          Quick Play
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {actionButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={btn.id}
                data-ocid={btn.ocid}
                onClick={() => navigate(btn.screen)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileTap={{ scale: 0.97 }}
                className={`game-card p-4 flex flex-col items-start gap-3 relative overflow-hidden active:scale-95 transition-all hover:border-primary/30 group ${btn.id === "start_game" ? "col-span-2" : ""}`}
              >
                {/* Gradient background blob */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-bl ${btn.color} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`}
                />

                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${btn.color} flex items-center justify-center text-primary-foreground ${btn.shadowColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="text-left">
                  <p className="font-display font-bold text-foreground text-sm leading-tight">
                    {btn.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {btn.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
