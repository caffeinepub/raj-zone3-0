import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { QuestionCategory } from "../backend.d";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../context/GameContext";

const categories = [
  {
    key: QuestionCategory.history,
    label: "History",
    emoji: "📜",
    color: "from-chart-4 to-chart-1",
  },
  {
    key: QuestionCategory.politicalScience,
    label: "Political Science",
    emoji: "🏛️",
    color: "from-chart-3 to-chart-2",
  },
  {
    key: QuestionCategory.chemistry,
    label: "Chemistry",
    emoji: "⚗️",
    color: "from-chart-2 to-chart-3",
  },
  {
    key: QuestionCategory.physics,
    label: "Physics",
    emoji: "⚡",
    color: "from-accent to-primary",
  },
  {
    key: QuestionCategory.biology,
    label: "Biology",
    emoji: "🧬",
    color: "from-chart-2 to-chart-1",
  },
  {
    key: QuestionCategory.mathematics,
    label: "Mathematics",
    emoji: "➗",
    color: "from-chart-5 to-destructive",
  },
  {
    key: QuestionCategory.generalKnowledge,
    label: "General Knowledge",
    emoji: "🌍",
    color: "from-chart-1 to-chart-4",
  },
  {
    key: QuestionCategory.logicalReasoning,
    label: "Logical Reasoning",
    emoji: "🧠",
    color: "from-chart-3 to-chart-4",
  },
];

export function CategoriesScreen() {
  const { navigate, setSelectedCategory } = useGame();

  const handleSelectCategory = (cat: QuestionCategory) => {
    setSelectedCategory(cat);
    navigate("difficulty");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh pb-20"
      data-ocid="categories.section"
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
            Categories
          </h1>
          <p className="text-xs text-muted-foreground">Choose your subject</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.key}
              data-ocid={`categories.item.${idx + 1}`}
              onClick={() => handleSelectCategory(cat.key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="game-card p-4 flex flex-col items-center gap-3 relative overflow-hidden hover:border-primary/30 group transition-all shadow-card-raise"
            >
              {/* Background gradient blob */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-bl ${cat.color} opacity-10 blur-xl group-hover:opacity-25 transition-opacity`}
              />

              <span className="text-4xl" aria-hidden="true">
                {cat.emoji}
              </span>
              <div className="text-center">
                <p className="font-display font-bold text-foreground text-sm leading-tight">
                  {cat.label}
                </p>
              </div>

              {/* Bottom gradient line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cat.color} opacity-40 group-hover:opacity-100 transition-opacity`}
              />
            </motion.button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
