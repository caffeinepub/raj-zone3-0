import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type {
  Question,
  QuestionCategory,
  QuestionDifficulty,
  UserProfile,
} from "../backend.d";

export type Screen =
  | "splash"
  | "auth"
  | "home"
  | "categories"
  | "difficulty"
  | "gameplay"
  | "result"
  | "leaderboard"
  | "profile"
  | "tournament";

interface GameState {
  screen: Screen;
  selectedCategory: QuestionCategory | null;
  selectedDifficulty: QuestionDifficulty | null;
  timerMode: boolean;
  questions: Question[];
  questionIndex: number;
  selectedAnswer: number | null;
  score: number;
  streak: number;
  highestStreak: number;
  sessionAnswers: number[];
  profile: UserProfile | null;
  // Tournament
  tournamentRegistrationId: bigint | null;
  tournamentAnswers: bigint[];
  isTournamentMode: boolean;
}

interface GameContextValue extends GameState {
  navigate: (screen: Screen) => void;
  setSelectedCategory: (cat: QuestionCategory) => void;
  setSelectedDifficulty: (diff: QuestionDifficulty) => void;
  setTimerMode: (val: boolean) => void;
  setQuestions: (questions: Question[]) => void;
  setQuestionIndex: (idx: number) => void;
  setSelectedAnswer: (idx: number | null) => void;
  addScore: (pts: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addSessionAnswer: (answerIdx: number) => void;
  resetGame: () => void;
  setProfile: (profile: UserProfile | null) => void;
  setTournamentRegistrationId: (id: bigint | null) => void;
  addTournamentAnswer: (answer: bigint) => void;
  setIsTournamentMode: (val: boolean) => void;
  resetTournament: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

const initialState: GameState = {
  screen: "splash",
  selectedCategory: null,
  selectedDifficulty: null,
  timerMode: false,
  questions: [],
  questionIndex: 0,
  selectedAnswer: null,
  score: 0,
  streak: 0,
  highestStreak: 0,
  sessionAnswers: [],
  profile: null,
  tournamentRegistrationId: null,
  tournamentAnswers: [],
  isTournamentMode: false,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const navigate = useCallback((screen: Screen) => {
    setState((prev) => ({ ...prev, screen }));
  }, []);

  const setSelectedCategory = useCallback((cat: QuestionCategory) => {
    setState((prev) => ({ ...prev, selectedCategory: cat }));
  }, []);

  const setSelectedDifficulty = useCallback((diff: QuestionDifficulty) => {
    setState((prev) => ({ ...prev, selectedDifficulty: diff }));
  }, []);

  const setTimerMode = useCallback((val: boolean) => {
    setState((prev) => ({ ...prev, timerMode: val }));
  }, []);

  const setQuestions = useCallback((questions: Question[]) => {
    setState((prev) => ({
      ...prev,
      questions,
      questionIndex: 0,
      selectedAnswer: null,
      score: 0,
      streak: 0,
      highestStreak: 0,
      sessionAnswers: [],
    }));
  }, []);

  const setQuestionIndex = useCallback((idx: number) => {
    setState((prev) => ({ ...prev, questionIndex: idx, selectedAnswer: null }));
  }, []);

  const setSelectedAnswer = useCallback((idx: number | null) => {
    setState((prev) => ({ ...prev, selectedAnswer: idx }));
  }, []);

  const addScore = useCallback((pts: number) => {
    setState((prev) => ({ ...prev, score: prev.score + pts }));
  }, []);

  const incrementStreak = useCallback(() => {
    setState((prev) => {
      const newStreak = prev.streak + 1;
      return {
        ...prev,
        streak: newStreak,
        highestStreak: Math.max(prev.highestStreak, newStreak),
      };
    });
  }, []);

  const resetStreak = useCallback(() => {
    setState((prev) => ({ ...prev, streak: 0 }));
  }, []);

  const addSessionAnswer = useCallback((answerIdx: number) => {
    setState((prev) => ({
      ...prev,
      sessionAnswers: [...prev.sessionAnswers, answerIdx],
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      questions: [],
      questionIndex: 0,
      selectedAnswer: null,
      score: 0,
      streak: 0,
      highestStreak: 0,
      sessionAnswers: [],
      isTournamentMode: false,
    }));
  }, []);

  const setProfile = useCallback((profile: UserProfile | null) => {
    setState((prev) => ({ ...prev, profile }));
  }, []);

  const setTournamentRegistrationId = useCallback((id: bigint | null) => {
    setState((prev) => ({ ...prev, tournamentRegistrationId: id }));
  }, []);

  const addTournamentAnswer = useCallback((answer: bigint) => {
    setState((prev) => ({
      ...prev,
      tournamentAnswers: [...prev.tournamentAnswers, answer],
    }));
  }, []);

  const setIsTournamentMode = useCallback((val: boolean) => {
    setState((prev) => ({ ...prev, isTournamentMode: val }));
  }, []);

  const resetTournament = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tournamentRegistrationId: null,
      tournamentAnswers: [],
      isTournamentMode: false,
      questions: [],
      questionIndex: 0,
      selectedAnswer: null,
      score: 0,
      streak: 0,
      highestStreak: 0,
      sessionAnswers: [],
    }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        navigate,
        setSelectedCategory,
        setSelectedDifficulty,
        setTimerMode,
        setQuestions,
        setQuestionIndex,
        setSelectedAnswer,
        addScore,
        incrementStreak,
        resetStreak,
        addSessionAnswer,
        resetGame,
        setProfile,
        setTournamentRegistrationId,
        addTournamentAnswer,
        setIsTournamentMode,
        resetTournament,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
