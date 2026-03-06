import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Question } from "../backend.d";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";

const fallbackTournamentQuestions: Question[] = [
  {
    id: 10n,
    category: "generalKnowledge" as never,
    difficulty: "moderate" as never,
    statements: [
      "India gained independence in 1947.",
      "The capital of India is Mumbai.",
      "The Indian flag has three horizontal stripes.",
    ],
    lieIndex: 1n,
    explanation: "The capital of India is New Delhi, not Mumbai.",
  },
  {
    id: 11n,
    category: "physics" as never,
    difficulty: "moderate" as never,
    statements: [
      "Einstein developed the theory of relativity.",
      "Newton discovered gravity by observing a falling apple.",
      "Electricity was invented by Thomas Edison.",
    ],
    lieIndex: 2n,
    explanation:
      "Electricity was discovered/harnessed by many scientists; Edison did not invent it.",
  },
  {
    id: 12n,
    category: "biology" as never,
    difficulty: "moderate" as never,
    statements: [
      "The human body has 206 bones.",
      "The liver is the largest internal organ.",
      "Blood is blue inside the body.",
    ],
    lieIndex: 2n,
    explanation:
      "Blood is always red; it contains hemoglobin which is red when oxygenated.",
  },
  {
    id: 13n,
    category: "chemistry" as never,
    difficulty: "moderate" as never,
    statements: [
      "H2O is the chemical formula for water.",
      "Iron has the chemical symbol Fe.",
      "Carbon dioxide is composed of one carbon and three oxygen atoms.",
    ],
    lieIndex: 2n,
    explanation: "CO2 has one carbon and TWO oxygen atoms, not three.",
  },
  {
    id: 14n,
    category: "mathematics" as never,
    difficulty: "moderate" as never,
    statements: [
      "The Pythagorean theorem states a² + b² = c².",
      "Zero is neither positive nor negative.",
      "The square root of 16 is 5.",
    ],
    lieIndex: 2n,
    explanation: "The square root of 16 is 4, not 5.",
  },
  {
    id: 15n,
    category: "history" as never,
    difficulty: "moderate" as never,
    statements: [
      "World War I began in 1914.",
      "Mahatma Gandhi led India's independence movement.",
      "The Berlin Wall fell in 1975.",
    ],
    lieIndex: 2n,
    explanation: "The Berlin Wall fell in November 1989, not 1975.",
  },
  {
    id: 16n,
    category: "generalKnowledge" as never,
    difficulty: "moderate" as never,
    statements: [
      "The Great Barrier Reef is located in Australia.",
      "Mount Everest is the tallest mountain on Earth.",
      "The Sahara is the world's largest desert overall.",
    ],
    lieIndex: 2n,
    explanation:
      "Antarctica is the world's largest desert. The Sahara is the largest hot desert.",
  },
  {
    id: 17n,
    category: "logicalReasoning" as never,
    difficulty: "moderate" as never,
    statements: [
      "All mammals breathe air.",
      "Some birds cannot fly.",
      "All reptiles are cold-blooded and have feathers.",
    ],
    lieIndex: 2n,
    explanation:
      "Reptiles are cold-blooded but they have scales, not feathers. Feathers are for birds.",
  },
  {
    id: 18n,
    category: "physics" as never,
    difficulty: "hard" as never,
    statements: [
      "The speed of sound in air is approximately 343 m/s.",
      "Absolute zero is −273.15°C.",
      "Protons carry a negative charge.",
    ],
    lieIndex: 2n,
    explanation:
      "Protons carry a positive charge. Electrons carry a negative charge.",
  },
  {
    id: 19n,
    category: "chemistry" as never,
    difficulty: "hard" as never,
    statements: [
      "The periodic table was created by Dmitri Mendeleev.",
      "Neon is a noble gas.",
      "Acids have a pH greater than 7.",
    ],
    lieIndex: 2n,
    explanation: "Acids have a pH less than 7. Bases have a pH greater than 7.",
  },
];

type TournamentPhase = "register" | "payment" | "playing";

export function TournamentScreen() {
  const {
    navigate,
    setTournamentRegistrationId,
    setQuestions,
    setIsTournamentMode,
  } = useGame();
  const { actor, isFetching } = useActor();

  const [phase, setPhase] = useState<TournamentPhase>("register");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [regId, setRegId] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  const UPI_ID = "9387785126@inhdfc";
  const UPI_NUMBER = "9387785126";
  const ENTRY_FEE = "₹10";

  const handleRegister = async () => {
    if (!name.trim() || !mobile.trim()) {
      toast.error("Please fill in name and mobile number");
      return;
    }
    if (mobile.trim().length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    setIsLoading(true);
    try {
      let id: bigint;
      if (actor && !isFetching) {
        id = await actor.registerTournament(name.trim(), mobile.trim());
      } else {
        // Demo: generate a fake registration ID
        id = BigInt(Date.now());
      }
      setRegId(id);
      setTournamentRegistrationId(id);
      setPhase("payment");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      if (actor && regId !== null) {
        await actor.confirmPayment(regId);
      }

      // Load tournament questions
      let questions: Question[] = [];
      if (actor && !isFetching) {
        try {
          questions = await actor.getTournamentQuestions();
        } catch {
          questions = [];
        }
      }
      if (!questions || questions.length === 0) {
        questions = fallbackTournamentQuestions;
      }

      setQuestions(questions);
      setIsTournamentMode(true);
      toast.success("Payment confirmed! Good luck! 🎮");
      navigate("gameplay");
    } catch (err) {
      console.error(err);
      toast.error("Could not confirm payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-mesh pb-6"
      data-ocid="tournament.section"
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
            Weekly Tournament
          </h1>
          <p className="text-xs text-muted-foreground">
            Compete for glory & prizes
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 space-y-4">
        {/* Tournament info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-5 bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30 shadow-card-raise relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="flex items-start gap-4 relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-game-glow flex-shrink-0">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground">
                Weekly Challenge
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <Timer className="w-3.5 h-3.5 text-primary" />
                  <span>10 Questions</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <Timer className="w-3.5 h-3.5 text-accent" />
                  <span>30 sec each</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-primary font-bold text-sm">
                    {ENTRY_FEE}
                  </span>
                  <span className="text-foreground/70">Entry Fee</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-4"
            >
              <div className="game-card p-5 space-y-4 shadow-card-raise">
                <h3 className="font-display font-bold text-foreground">
                  Registration
                </h3>

                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground/80">
                    Full Name
                  </Label>
                  <Input
                    data-ocid="tournament.name.input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground/80">
                    Mobile Number
                  </Label>
                  <Input
                    data-ocid="tournament.mobile.input"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    type="tel"
                    maxLength={10}
                    className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>

                <div className="pt-1 p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Entry Fee
                  </p>
                  <p className="font-display font-black text-2xl text-primary">
                    {ENTRY_FEE}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pay after registration via UPI
                  </p>
                </div>

                <Button
                  data-ocid="tournament.register.primary_button"
                  onClick={handleRegister}
                  disabled={isLoading || !name.trim() || !mobile.trim()}
                  className="w-full h-12 bg-primary text-primary-foreground font-display font-bold shadow-game-glow"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? "Registering..." : "Register Now"}
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-4"
            >
              {/* Payment instructions */}
              <div className="game-card p-5 border-accent/30 shadow-card-raise space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-game-success" />
                  <h3 className="font-display font-bold text-foreground">
                    Registration Successful!
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reg. ID:{" "}
                  <span className="font-mono text-foreground/70">
                    {String(regId)}
                  </span>
                </p>

                <div className="p-4 rounded-xl bg-primary/15 border border-primary/30 space-y-3">
                  <p className="font-display font-bold text-foreground text-base">
                    Pay {ENTRY_FEE} via UPI
                  </p>

                  {/* UPI ID */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      UPI ID
                    </p>
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2.5">
                      <span className="font-mono text-foreground flex-1 text-sm font-bold">
                        {UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-game-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Phone number */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Phone / UPI Number
                    </p>
                    <div className="bg-secondary/50 rounded-lg p-2.5">
                      <span className="font-mono text-foreground text-sm font-bold">
                        {UPI_NUMBER}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs text-muted-foreground">
                      Amount
                    </span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <p className="font-display font-black text-3xl text-accent text-center">
                    {ENTRY_FEE}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  After paying, click the button below to confirm your payment
                  and start playing.
                </p>

                <Button
                  data-ocid="tournament.paid.confirm_button"
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-primary-foreground font-display font-bold shadow-game-glow"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {isLoading
                    ? "Confirming..."
                    : "I Have Paid – Start Tournament"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer branding */}
      <footer className="px-4 pt-4 pb-2 text-center">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
