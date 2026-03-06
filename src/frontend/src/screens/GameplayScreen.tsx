import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ChevronRight,
  Flame,
  Star,
  Timer,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";

const STATEMENT_LABELS = ["A", "B", "C"];

function TimerBar({
  seconds,
  total = 30,
}: { seconds: number; total?: number }) {
  const pct = (seconds / total) * 100;
  const color =
    seconds > 15
      ? "bg-game-success"
      : seconds > 7
        ? "bg-game-warning"
        : "bg-game-error";
  return (
    <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full transition-colors`}
        style={{ width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "linear" }}
      />
    </div>
  );
}

export function GameplayScreen() {
  const {
    navigate,
    questions,
    questionIndex,
    selectedAnswer,
    setSelectedAnswer,
    setQuestionIndex,
    score,
    addScore,
    streak,
    incrementStreak,
    resetStreak,
    addSessionAnswer,
    sessionAnswers,
    timerMode,
    isTournamentMode,
    addTournamentAnswer,
    tournamentRegistrationId,
    selectedCategory,
    selectedDifficulty,
    highestStreak,
  } = useGame();
  const { actor } = useActor();

  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timedOut, setTimedOut] = useState(false);

  const currentQuestion = questions[questionIndex];

  const handleTimeOut = useCallback(() => {
    if (!submitted) {
      setTimedOut(true);
      setSubmitted(true);
      resetStreak();
      addSessionAnswer(-1); // -1 = timed out
    }
  }, [submitted, resetStreak, addSessionAnswer]);

  // Timer
  useEffect(() => {
    if (!timerMode && !isTournamentMode) return;
    if (submitted) return;
    setTimeLeft(30);
    setTimedOut(false);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerMode, isTournamentMode, submitted, handleTimeOut]);

  // Reset submitted state when question changes (biome: questionIndex intentionally tracked)
  // biome-ignore lint/correctness/useExhaustiveDependencies: questionIndex triggers reset
  useEffect(() => {
    setSubmitted(false);
    setTimedOut(false);
  }, [questionIndex]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <p className="text-muted-foreground">No questions available</p>
          <Button onClick={() => navigate("home")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const lieIdx = Number(currentQuestion.lieIndex);
  const isCorrect = submitted && selectedAnswer === lieIdx;

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer first");
      return;
    }
    setSubmitted(true);

    const correct = selectedAnswer === lieIdx;
    if (correct) {
      addScore(10 + streak * 2);
      incrementStreak();
    } else {
      resetStreak();
    }
    addSessionAnswer(selectedAnswer);

    if (isTournamentMode) {
      addTournamentAnswer(BigInt(selectedAnswer));
    }
  };

  const handleNext = async () => {
    const isLast = questionIndex >= questions.length - 1;
    if (isLast) {
      // End of session
      if (
        !isTournamentMode &&
        actor &&
        selectedCategory &&
        selectedDifficulty
      ) {
        try {
          await actor.recordGameSession(
            selectedCategory,
            selectedDifficulty,
            BigInt(score + (isCorrect ? 10 + streak * 2 : 0)),
            BigInt(highestStreak),
          );
        } catch (e) {
          console.error("Failed to record session:", e);
        }
      }

      if (isTournamentMode && actor && tournamentRegistrationId !== null) {
        const allAnswers = [...sessionAnswers.map((a) => BigInt(a))];
        try {
          await actor.submitTournamentSession(
            tournamentRegistrationId,
            allAnswers,
            BigInt(score),
          );
          toast.success("Tournament session submitted!");
        } catch (e) {
          console.error("Failed to submit tournament:", e);
        }
      }
      navigate("result");
    } else {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const getStatementState = (
    idx: number,
  ): "default" | "selected" | "correct" | "wrong" | "reveal" => {
    if (!submitted) {
      return selectedAnswer === idx ? "selected" : "default";
    }
    if (idx === lieIdx) return "correct"; // always highlight the actual lie
    if (selectedAnswer === idx && idx !== lieIdx) return "wrong";
    return "default";
  };

  const stateStyles: Record<string, string> = {
    default: "border-border/50 bg-card hover:border-primary/30",
    selected: "border-primary/60 bg-primary/10",
    correct: "border-game-success bg-game-success/15 glow-success",
    wrong: "border-game-error bg-game-error/15 glow-error",
    reveal: "border-border/30 bg-card/50",
  };

  const showTimer = timerMode || isTournamentMode;

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh"
      data-ocid="gameplay.section"
    >
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        {/* Stats row */}
        <div className="flex items-center gap-2">
          <div
            data-ocid="gameplay.score.section"
            className="flex-1 game-card px-3 py-2 flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="font-display font-black text-foreground text-sm">
              {score}
            </span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          <div
            data-ocid="gameplay.streak.section"
            className="flex-1 game-card px-3 py-2 flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-primary fill-primary" />
            <span className="font-display font-black text-foreground text-sm">
              {streak}
            </span>
            <span className="text-xs text-muted-foreground">streak</span>
          </div>
          {showTimer && (
            <div
              data-ocid="gameplay.timer.section"
              className={`flex-1 game-card px-3 py-2 flex items-center gap-2 ${timeLeft <= 7 ? "border-game-error/50" : ""}`}
            >
              <Timer
                className={`w-4 h-4 ${timeLeft <= 7 ? "text-game-error" : "text-muted-foreground"}`}
              />
              <span
                className={`font-display font-black text-sm ${timeLeft <= 7 ? "text-game-error" : "text-foreground"}`}
              >
                {timeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* Timer bar */}
        {showTimer && !submitted && <TimerBar seconds={timeLeft} />}

        {/* Progress */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-semibold">
            Question {questionIndex + 1} of {questions.length}
          </p>
          <div className="flex gap-1">
            {questions.map((q, i) => (
              <div
                key={`progress-${String(q.id)}-${i}`}
                className={`h-1.5 rounded-full transition-all ${
                  i < questionIndex
                    ? "w-4 bg-primary"
                    : i === questionIndex
                      ? "w-6 bg-accent"
                      : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question card */}
      <main className="flex-1 px-4 space-y-4 pb-6">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="game-card p-4 shadow-card-raise"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary uppercase tracking-wide">
              {String(currentQuestion.category)
                .replace(/([A-Z])/g, " $1")
                .trim()}
            </span>
          </div>
          <p className="font-display font-bold text-foreground text-base leading-snug">
            Two Truths &amp; One Lie — Find the Lie!
          </p>
        </motion.div>

        {/* Statement cards */}
        <div className="space-y-3">
          {currentQuestion.statements.map((statement, idx) => {
            const state = getStatementState(idx);
            return (
              <motion.button
                key={`stmt-${String(currentQuestion.id)}-${idx}`}
                data-ocid={`gameplay.statement.${idx + 1}`}
                onClick={() => !submitted && setSelectedAnswer(idx)}
                disabled={submitted}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileTap={!submitted ? { scale: 0.98 } : {}}
                className={`w-full game-card p-4 flex items-start gap-3 border-2 transition-all text-left disabled:cursor-default ${stateStyles[state]}`}
              >
                <span className="font-display font-black text-lg leading-none mt-0.5 text-primary/80 flex-shrink-0">
                  {STATEMENT_LABELS[idx]}
                </span>
                <p className="font-body text-sm text-foreground leading-relaxed flex-1">
                  {statement}
                </p>
                {submitted && idx === lieIdx && (
                  <CheckCircle2 className="w-5 h-5 text-game-success flex-shrink-0 mt-0.5" />
                )}
                {submitted && selectedAnswer === idx && idx !== lieIdx && (
                  <XCircle className="w-5 h-5 text-game-error flex-shrink-0 mt-0.5" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`game-card p-4 border-l-4 ${
                isCorrect
                  ? "border-l-game-success bg-game-success/10"
                  : timedOut
                    ? "border-l-game-warning bg-game-warning/10"
                    : "border-l-game-error bg-game-error/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-game-success flex-shrink-0 mt-0.5" />
                ) : timedOut ? (
                  <Timer className="w-5 h-5 text-game-warning flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-game-error flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-display font-bold text-sm ${
                      isCorrect
                        ? "text-game-success"
                        : timedOut
                          ? "text-game-warning"
                          : "text-game-error"
                    }`}
                  >
                    {isCorrect
                      ? `Correct! +${10 + (streak > 0 ? (streak - 1) * 2 : 0)} pts 🎉`
                      : timedOut
                        ? "Time's up!"
                        : `Wrong! ${STATEMENT_LABELS[lieIdx]} is the Lie`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          {!submitted ? (
            <Button
              data-ocid="gameplay.submit.primary_button"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="flex-1 h-12 bg-primary text-primary-foreground font-display font-bold shadow-game-glow disabled:opacity-40"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              data-ocid="gameplay.next.button"
              onClick={handleNext}
              className="flex-1 h-12 bg-primary text-primary-foreground font-display font-bold shadow-game-glow"
            >
              {questionIndex >= questions.length - 1
                ? "See Results"
                : "Next Question"}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
