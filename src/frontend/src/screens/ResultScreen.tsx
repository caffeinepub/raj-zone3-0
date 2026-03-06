import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown, Home, Share2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../context/GameContext";

export function ResultScreen() {
  const {
    navigate,
    questions,
    sessionAnswers,
    score,
    highestStreak,
    resetGame,
    isTournamentMode,
    resetTournament,
  } = useGame();

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const correctCount = sessionAnswers.filter(
    (ans, i) => questions[i] && ans === Number(questions[i].lieIndex),
  ).length;

  const accuracy =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

  const handleShare = async () => {
    const text = `🎮 Raj_zone3.0 – Two Truths & A Lie\n✅ ${correctCount}/${questions.length} correct\n⭐ Score: ${score} points\n🔥 Streak: ${highestStreak}\nPlay now at raj_zone3.0!`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Score copied to clipboard! Share it 🚀");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleGoHome = () => {
    if (isTournamentMode) {
      resetTournament();
    } else {
      resetGame();
    }
    navigate("home");
  };

  const lastAnswerIdx = sessionAnswers[sessionAnswers.length - 1] ?? -1;
  const lastQuestion = questions[questions.length - 1];
  const lastCorrect =
    lastQuestion && lastAnswerIdx === Number(lastQuestion.lieIndex);

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh pb-6"
      data-ocid="result.section"
    >
      <div className="px-4 pt-6 space-y-4">
        {/* Big result indicator */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          className={`flex flex-col items-center justify-center py-8 game-card relative overflow-hidden ${
            lastCorrect ? "border-game-success/30" : "border-game-error/30"
          }`}
        >
          <div
            className={`absolute inset-0 ${
              lastCorrect ? "bg-game-success/5" : "bg-game-error/5"
            }`}
          />
          {lastCorrect ? (
            <CheckCircle2 className="w-16 h-16 text-game-success" />
          ) : (
            <XCircle className="w-16 h-16 text-game-error" />
          )}
          <h1 className="font-display font-black text-3xl mt-4 text-foreground">
            {isTournamentMode ? "Tournament Complete!" : "Session Complete!"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lastCorrect ? "Great finish!" : "Keep practicing!"}
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="game-card p-3 text-center">
            <p className="font-display font-black text-2xl text-primary">
              {score}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Score</p>
          </div>
          <div className="game-card p-3 text-center">
            <p className="font-display font-black text-2xl text-accent">
              {correctCount}/{questions.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Correct</p>
          </div>
          <div className="game-card p-3 text-center">
            <p className="font-display font-black text-2xl text-game-success">
              {accuracy}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Accuracy</p>
          </div>
        </motion.div>

        {/* Question breakdown */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-widest">
            Question Breakdown
          </h2>
          {questions.map((q, idx) => {
            const userAns = sessionAnswers[idx];
            const correct = userAns === Number(q.lieIndex);
            const isOpen = expandedIdx === idx;
            return (
              <motion.div
                key={String(q.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.06 }}
                className={`game-card border ${
                  correct ? "border-game-success/30" : "border-game-error/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedIdx(isOpen ? null : idx)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  {correct ? (
                    <CheckCircle2 className="w-4 h-4 text-game-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-game-error flex-shrink-0" />
                  )}
                  <p className="flex-1 text-sm text-foreground font-medium truncate">
                    Q{idx + 1}: {q.statements[0].slice(0, 40)}...
                  </p>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-4 pb-3 space-y-2"
                  >
                    <p className="text-xs text-muted-foreground font-semibold">
                      Correct Answer: Statement{" "}
                      {["A", "B", "C"][Number(q.lieIndex)]} is the Lie
                    </p>
                    {userAns !== undefined && userAns >= 0 && (
                      <p className="text-xs text-muted-foreground">
                        Your answer: Statement{" "}
                        {userAns < 0 ? "(timed out)" : ["A", "B", "C"][userAns]}
                      </p>
                    )}
                    <p className="text-xs text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-2">
                      {q.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-2"
        >
          <Button
            data-ocid="result.share.button"
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-border/50 hover:border-primary/50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            data-ocid="result.home.button"
            onClick={handleGoHome}
            className="flex-1 bg-primary text-primary-foreground shadow-game-glow hover:bg-primary/90"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
