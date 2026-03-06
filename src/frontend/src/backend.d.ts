import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    rank: bigint;
    score: bigint;
    playerName: string;
}
export interface Question {
    id: bigint;
    difficulty: QuestionDifficulty;
    explanation: string;
    category: QuestionCategory;
    statements: Array<string>;
    lieIndex: bigint;
}
export interface UserProfile {
    emailOrPhone: string;
    name: string;
    badges: Array<string>;
    highestStreak: bigint;
    totalScore: bigint;
    currentLevel: bigint;
}
export enum QuestionCategory {
    logicalReasoning = "logicalReasoning",
    biology = "biology",
    politicalScience = "politicalScience",
    history = "history",
    chemistry = "chemistry",
    mathematics = "mathematics",
    physics = "physics",
    generalKnowledge = "generalKnowledge"
}
export enum QuestionDifficulty {
    easy = "easy",
    hard = "hard",
    moderate = "moderate"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(category: QuestionCategory, difficulty: QuestionDifficulty, statements: Array<string>, lieIndex: bigint, explanation: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardBadge(user: Principal, badgeName: string): Promise<void>;
    confirmPayment(registrationId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyChallenge(): Promise<Question | null>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getProfile(): Promise<UserProfile>;
    getQuestions(category: QuestionCategory, difficulty: QuestionDifficulty): Promise<Array<Question>>;
    getTournamentLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getTournamentQuestions(): Promise<Array<Question>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordGameSession(category: QuestionCategory, difficulty: QuestionDifficulty, score: bigint, streak: bigint): Promise<void>;
    register(name: string, emailOrPhone: string): Promise<void>;
    registerTournament(name: string, mobileNumber: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitTournamentSession(registrationId: bigint, answers: Array<bigint>, score: bigint): Promise<void>;
    updateProfileName(newName: string): Promise<void>;
}
