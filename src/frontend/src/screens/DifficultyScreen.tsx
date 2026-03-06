import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Timer, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Question, QuestionDifficulty } from "../backend.d";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";

const fallbackQuestions: Question[] = [
  {
    id: 1n,
    category: "physics" as never,
    difficulty: "easy" as never,
    statements: [
      "Light travels faster than sound.",
      "Humans can hear frequencies above 50,000 Hz.",
      "Speed of light is about 300,000 km/s.",
    ],
    lieIndex: 1n,
    explanation: "Human hearing range is roughly 20 Hz to 20,000 Hz.",
  },
  {
    id: 2n,
    category: "history" as never,
    difficulty: "easy" as never,
    statements: [
      "World War II ended in 1945.",
      "The French Revolution began in 1789.",
      "The Great Wall of China was built in the 20th century.",
    ],
    lieIndex: 2n,
    explanation:
      "The Great Wall of China was built primarily during the Ming dynasty (1368–1644).",
  },
  {
    id: 3n,
    category: "biology" as never,
    difficulty: "easy" as never,
    statements: [
      "DNA stands for Deoxyribonucleic Acid.",
      "Humans have 46 chromosomes.",
      "The heart is located on the right side of the chest.",
    ],
    lieIndex: 2n,
    explanation:
      "The human heart is located slightly to the left of center in the chest.",
  },
  {
    id: 4n,
    category: "chemistry" as never,
    difficulty: "easy" as never,
    statements: [
      "Water is H2O.",
      "Oxygen has atomic number 8.",
      "Gold has the chemical symbol Ag.",
    ],
    lieIndex: 2n,
    explanation:
      'Gold chemical symbol is Au (from Latin "Aurum"). Ag is Silver.',
  },
  {
    id: 5n,
    category: "mathematics" as never,
    difficulty: "easy" as never,
    statements: [
      "Pi is approximately 3.14159.",
      "The sum of angles in a triangle is 180°.",
      "A prime number can be divided evenly by 4.",
    ],
    lieIndex: 2n,
    explanation: "A prime number is only divisible by 1 and itself, not by 4.",
  },
];

const difficulties = [
  {
    key: QuestionDifficulty.easy,
    label: "Easy",
    emoji: "🟢",
    ocid: "difficulty.easy.button",
    desc: "Perfect for beginners",
    color: "border-game-success/40 hover:border-game-success",
    activeBg: "bg-game-success/15",
    textColor: "text-game-success",
  },
  {
    key: QuestionDifficulty.moderate,
    label: "Moderate",
    emoji: "🟡",
    ocid: "difficulty.moderate.button",
    desc: "Test your knowledge",
    color: "border-game-warning/40 hover:border-game-warning",
    activeBg: "bg-game-warning/15",
    textColor: "text-game-warning",
  },
  {
    key: QuestionDifficulty.hard,
    label: "Hard",
    emoji: "🔴",
    ocid: "difficulty.hard.button",
    desc: "For true scholars",
    color: "border-game-error/40 hover:border-game-error",
    activeBg: "bg-game-error/15",
    textColor: "text-game-error",
  },
];

export function DifficultyScreen() {
  const {
    navigate,
    selectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    timerMode,
    setTimerMode,
    setQuestions,
  } = useGame();
  const { actor, isFetching } = useActor();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!selectedDifficulty) {
      toast.error("Please select a difficulty level");
      return;
    }
    if (!selectedCategory) {
      navigate("categories");
      return;
    }
    setIsLoading(true);
    try {
      let questions: Question[] = [];
      if (actor && !isFetching) {
        questions = await actor.getQuestions(
          selectedCategory,
          selectedDifficulty,
        );
      }
      if (!questions || questions.length === 0) {
        questions = fallbackQuestions;
        toast.info("Using sample questions for demo");
      }
      setQuestions(questions);
      navigate("gameplay");
    } catch (err) {
      console.error(err);
      setQuestions(fallbackQuestions);
      toast.info("Using sample questions");
      navigate("gameplay");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh pb-20">
      <header className="p-4 pt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("categories")}
          className="w-9 h-9 rounded-xl game-card flex items-center justify-center hover:border-primary/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-display font-black text-xl text-foreground">
            Difficulty
          </h1>
          <p className="text-xs text-muted-foreground">
            Choose your challenge level
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 py-2 space-y-3">
        {difficulties.map((diff, idx) => (
          <motion.button
            key={diff.key}
            data-ocid={diff.ocid}
            onClick={() => setSelectedDifficulty(diff.key)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full game-card p-5 flex items-center gap-4 border transition-all ${diff.color} ${
              selectedDifficulty === diff.key
                ? `${diff.activeBg} border-opacity-100`
                : ""
            }`}
          >
            <span className="text-3xl">{diff.emoji}</span>
            <div className="text-left flex-1">
              <p className={`font-display font-bold text-lg ${diff.textColor}`}>
                {diff.label}
              </p>
              <p className="text-xs text-muted-foreground">{diff.desc}</p>
            </div>
            {selectedDifficulty === diff.key && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-6 h-6 rounded-full ${diff.textColor} border-2 border-current flex items-center justify-center`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-current" />
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Timer mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="game-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                Timer Mode
              </p>
              <p className="text-xs text-muted-foreground">
                30 seconds per question
              </p>
            </div>
          </div>
          <Switch
            data-ocid="difficulty.timer_mode.switch"
            checked={timerMode}
            onCheckedChange={setTimerMode}
            className="data-[state=checked]:bg-primary"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="pt-2"
        >
          <Button
            data-ocid="difficulty.start.primary_button"
            onClick={handleStart}
            disabled={!selectedDifficulty || isLoading}
            className="w-full h-14 bg-primary text-primary-foreground font-display font-black text-lg tracking-wide shadow-game-glow hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            {isLoading ? "Loading Questions..." : "START GAME"}
          </Button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
