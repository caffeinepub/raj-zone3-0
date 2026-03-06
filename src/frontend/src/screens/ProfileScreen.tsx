import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit3,
  Flame,
  Loader2,
  LogOut,
  Star,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const ALL_BADGES = [
  {
    id: "beginner",
    label: "Beginner",
    emoji: "🌱",
    color: "bg-game-success/15 text-game-success border-game-success/30",
  },
  {
    id: "scholar",
    label: "Scholar",
    emoji: "📚",
    color: "bg-primary/15 text-primary border-primary/30",
  },
  {
    id: "master_mind",
    label: "Master Mind",
    emoji: "🧠",
    color: "bg-accent/15 text-accent border-accent/30",
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

export function ProfileScreen() {
  const { navigate, profile, setProfile } = useGame();
  const { actor } = useActor();
  const { clear, identity } = useInternetIdentity();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(profile?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const displayName = profile?.name ?? (identity ? "Player" : "Guest");
  const emailOrPhone = profile?.emailOrPhone ?? "—";
  const totalScore = profile ? Number(profile.totalScore) : 0;
  const highestStreak = profile ? Number(profile.highestStreak) : 0;
  const level = profile ? Number(profile.currentLevel) : 1;
  const earnedBadges = new Set(profile?.badges ?? []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setIsSaving(true);
    try {
      await actor.updateProfileName(editName.trim());
      if (profile) {
        setProfile({ ...profile, name: editName.trim() });
      }
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clear();
    setProfile(null);
    toast.info("Logged out");
    navigate("auth");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh pb-20"
      data-ocid="profile.section"
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
            Profile
          </h1>
          <p className="text-xs text-muted-foreground">
            Your stats & achievements
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 space-y-4">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-6 flex flex-col items-center text-center shadow-card-raise relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 pointer-events-none" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-black text-2xl shadow-game-glow">
            {getInitials(displayName)}
          </div>
          <h2 className="font-display font-black text-xl text-foreground mt-3">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{emailOrPhone}</p>

          <Button
            data-ocid="profile.edit.open_modal_button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(profile?.name ?? "");
              setEditOpen(true);
            }}
            className="mt-4 border-border/50 hover:border-primary/50"
          >
            <Edit3 className="w-3.5 h-3.5 mr-2" />
            Edit Profile
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="game-card p-3 text-center">
            <Star className="w-5 h-5 text-accent fill-accent mx-auto mb-1" />
            <p className="font-display font-black text-xl text-foreground">
              {totalScore.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Score</p>
          </div>
          <div className="game-card p-3 text-center">
            <Flame className="w-5 h-5 text-primary fill-primary mx-auto mb-1" />
            <p className="font-display font-black text-xl text-foreground">
              {highestStreak}
            </p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="game-card p-3 text-center">
            <Zap className="w-5 h-5 text-chart-2 mx-auto mb-1" />
            <p className="font-display font-black text-xl text-foreground">
              {level}
            </p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="game-card p-4 shadow-card-raise"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-sm text-foreground">
              Achievements
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_BADGES.map((badge) => {
              const earned =
                earnedBadges.has(badge.id) ||
                earnedBadges.has(badge.label.toLowerCase());
              return (
                <div
                  key={badge.id}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    earned
                      ? badge.color
                      : "bg-muted/30 text-muted-foreground border-border/30 opacity-50"
                  }`}
                >
                  <span>{badge.emoji}</span>
                  {badge.label}
                  {!earned && (
                    <span className="text-[10px] opacity-60">(locked)</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tournament button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => navigate("tournament")}
          className="w-full game-card p-4 flex items-center justify-between hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-game-glow">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-sm text-foreground">
                Weekly Tournament
              </p>
              <p className="text-xs text-muted-foreground">
                ₹10 entry • 10 questions
              </p>
            </div>
          </div>
          <div className="text-xs text-primary font-semibold group-hover:translate-x-1 transition-transform">
            Join →
          </div>
        </motion.button>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            data-ocid="profile.logout.button"
            variant="outline"
            onClick={handleLogout}
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          data-ocid="profile.edit.dialog"
          className="bg-card border-border/50 text-foreground max-w-sm mx-4"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-black text-foreground">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground/80">Name</Label>
              <Input
                data-ocid="profile.edit.input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="bg-secondary/50 border-border/50 text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              data-ocid="profile.edit.save_button"
              onClick={handleSaveProfile}
              disabled={isSaving || !editName.trim()}
              className="flex-1 bg-primary text-primary-foreground shadow-game-glow"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
