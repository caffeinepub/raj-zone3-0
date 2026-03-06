import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Loader2, LogIn, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../context/GameContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", flag: "🇧🇩" },
];

export function AuthScreen() {
  const { navigate, setProfile } = useGame();
  const { login, isLoggingIn, isLoginSuccess, identity } =
    useInternetIdentity();
  const { actor } = useActor();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [selectedLang, setSelectedLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  // Sign up form
  const [signupName, setSignupName] = useState("");
  const [signupEmailPhone, setSignupEmailPhone] = useState("");

  // Login form
  const [loginEmailPhone, setLoginEmailPhone] = useState("");

  const handleLogin = async () => {
    // Internet Identity login
    login();
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupEmailPhone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      await actor.register(signupName.trim(), signupEmailPhone.trim());
      const profile = await actor.getProfile();
      setProfile(profile);
      toast.success(`Welcome, ${signupName}! 🎉`);
      navigate("home");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful II login
  const handleIISuccess = async () => {
    if (!actor || !identity) return;
    setIsLoading(true);
    try {
      const profile = await actor.getCallerUserProfile();
      if (profile) {
        setProfile(profile);
        toast.success(`Welcome back, ${profile.name}! 🎮`);
        navigate("home");
      } else {
        // New user – prompt to register
        setActiveTab("signup");
        toast.info("Please complete your profile to get started");
      }
    } catch {
      navigate("home");
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for successful login
  if (isLoginSuccess && actor && identity && !isLoading) {
    void handleIISuccess();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-mesh relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl glow-primary overflow-hidden">
              <img
                src="/assets/generated/raj-zone-logo-transparent.dim_200x200.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-display text-2xl font-black text-foreground">
              Raj<span className="text-primary">_zone</span>
              <span className="text-accent">3.0</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to continue your academic journey
          </p>
        </div>

        {/* Auth card */}
        <div className="game-card shadow-card-raise p-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "login" | "signup")}
          >
            <TabsList className="w-full mb-6 bg-secondary/50">
              <TabsTrigger
                value="login"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="auth.tab"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="auth.tab"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">
                  Email / Phone
                </Label>
                <Input
                  data-ocid="auth.input"
                  placeholder="Enter email or phone"
                  value={loginEmailPhone}
                  onChange={(e) => setLoginEmailPhone(e.target.value)}
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Password</Label>
                <Input
                  placeholder="Enter password"
                  type="password"
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-primary hover:text-accent transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <Button
                data-ocid="auth.submit_button"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-game-glow"
                onClick={handleLogin}
                disabled={isLoggingIn || isLoading}
              >
                {isLoggingIn || isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isLoggingIn ? "Connecting..." : "Login with Internet Identity"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Full Name</Label>
                <Input
                  placeholder="Enter your name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">
                  Email / Phone
                </Label>
                <Input
                  data-ocid="auth.input"
                  placeholder="Enter email or phone"
                  value={signupEmailPhone}
                  onChange={(e) => setSignupEmailPhone(e.target.value)}
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Password</Label>
                <Input
                  placeholder="Create a password"
                  type="password"
                  className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <Button
                data-ocid="auth.submit_button"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-game-glow"
                onClick={handleSignup}
                disabled={isLoading || !actor}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Language selector */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 justify-center">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mr-1">
                Language:
              </span>
              {LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  data-ocid="auth.select"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                    selectedLang === lang.code
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
