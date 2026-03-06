import { Toaster } from "@/components/ui/sonner";
import { GameProvider, useGame } from "./context/GameContext";
import { AuthScreen } from "./screens/AuthScreen";
import { CategoriesScreen } from "./screens/CategoriesScreen";
import { DifficultyScreen } from "./screens/DifficultyScreen";
import { GameplayScreen } from "./screens/GameplayScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { TournamentScreen } from "./screens/TournamentScreen";

function AppScreens() {
  const { screen } = useGame();

  switch (screen) {
    case "splash":
      return <SplashScreen />;
    case "auth":
      return <AuthScreen />;
    case "home":
      return <HomeScreen />;
    case "categories":
      return <CategoriesScreen />;
    case "difficulty":
      return <DifficultyScreen />;
    case "gameplay":
      return <GameplayScreen />;
    case "result":
      return <ResultScreen />;
    case "leaderboard":
      return <LeaderboardScreen />;
    case "profile":
      return <ProfileScreen />;
    case "tournament":
      return <TournamentScreen />;
    default:
      return <SplashScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="max-w-md mx-auto min-h-screen relative">
        <AppScreens />
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.02 255)",
            border: "1px solid oklch(0.28 0.04 255)",
            color: "oklch(0.97 0.01 90)",
          },
        }}
      />
    </GameProvider>
  );
}
