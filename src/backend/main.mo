import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type QuestionCategory = {
    #history;
    #politicalScience;
    #chemistry;
    #physics;
    #biology;
    #mathematics;
    #generalKnowledge;
    #logicalReasoning;
  };

  type QuestionDifficulty = {
    #easy;
    #moderate;
    #hard;
  };

  type Question = {
    id : Nat;
    category : QuestionCategory;
    difficulty : QuestionDifficulty;
    statements : [Text];
    lieIndex : Nat;
    explanation : Text;
  };

  type UserProfile = {
    name : Text;
    emailOrPhone : Text;
    totalScore : Nat;
    highestStreak : Nat;
    currentLevel : Nat;
    badges : [Text];
  };

  type GameSession = {
    userId : Principal;
    category : QuestionCategory;
    difficulty : QuestionDifficulty;
    score : Nat;
    streak : Nat;
    completedAt : Time.Time;
  };

  type TournamentRegistration = {
    id : Nat;
    name : Text;
    mobileNumber : Text;
    hasPaid : Bool;
    registeredAt : Time.Time;
    registeredBy : Principal;
  };

  type TournamentSession = {
    registrationId : Nat;
    answers : [Nat];
    score : Nat;
    completedAt : Time.Time;
  };

  type LeaderboardEntry = {
    rank : Nat;
    playerName : Text;
    score : Nat;
  };

  module TournamentRegistration {
    public func compareByScore(t1 : TournamentSession, t2 : TournamentSession) : Order.Order {
      Int.compare(t2.score, t1.score);
    };
  };

  let questions = Map.empty<Nat, Question>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let gameSessions = Map.empty<Principal, List.List<GameSession>>();
  let tournaments = Map.empty<Nat, TournamentRegistration>();
  let tournamentSessions = Map.empty<Nat, TournamentSession>();
  var nextQuestionId = 1;
  var nextTournamentId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Int.compare(profile2.totalScore, profile1.totalScore);
    };
  };

  module LeaderboardEntry {
    public func compare(entry1 : LeaderboardEntry, entry2 : LeaderboardEntry) : Order.Order {
      Int.compare(entry2.score, entry1.score);
    };
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User registration - assigns user role
  public shared ({ caller }) func register(name : Text, emailOrPhone : Text) : async () {
    if (userProfiles.containsKey(caller)) { Runtime.trap("This user is already registered.") };

    let profile : UserProfile = {
      name;
      emailOrPhone;
      totalScore = 0;
      highestStreak = 0;
      currentLevel = 1;
      badges = [];
    };

    userProfiles.add(caller, profile);

    // Assign user role upon registration
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  // Get own profile (authenticated users only)
  public query ({ caller }) func getProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist.") };
      case (?profile) { profile };
    };
  };

  // Update profile name (authenticated users only)
  public shared ({ caller }) func updateProfileName(newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist.") };
      case (?profile) {
        let updatedProfile = {
          profile with name = newName;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Get questions - any authenticated user including guests
  public query ({ caller }) func getQuestions(category : QuestionCategory, difficulty : QuestionDifficulty) : async [Question] {
    let filtered = questions.values().filter(
      func(q) {
        q.category == category and q.difficulty == difficulty
      }
    );
    filtered.toArray();
  };

  // Record game session - authenticated users only
  public shared ({ caller }) func recordGameSession(category : QuestionCategory, difficulty : QuestionDifficulty, score : Nat, streak : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record game sessions");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist.") };
      case (?profile) {
        let updatedProfile = {
          profile with
          totalScore = profile.totalScore + score;
          highestStreak = if (streak > profile.highestStreak) { streak } else {
            profile.highestStreak;
          };
        };
        userProfiles.add(caller, updatedProfile);

        let newSession : GameSession = {
          userId = caller;
          category;
          difficulty;
          score;
          streak;
          completedAt = Time.now();
        };

        let existingSessions = switch (gameSessions.get(caller)) {
          case (null) { List.empty<GameSession>() };
          case (?sessions) { sessions };
        };
        existingSessions.add(newSession);
        gameSessions.add(caller, existingSessions);
      };
    };
  };

  // Get leaderboard - any user including guests
  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    var rank = 1;
    let entries = userProfiles.values().toArray().sort().map(
      func(profile) {
        let entry = {
          rank;
          playerName = profile.name;
          score = profile.totalScore;
        };
        rank += 1;
        entry;
      }
    );
    let end = if (entries.size() < 20) { entries.size() } else { 20 };
    entries.sliceToArray(0, end);
  };

  // Register for tournament - authenticated users only
  public shared ({ caller }) func registerTournament(name : Text, mobileNumber : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register for tournaments");
    };

    let registrationId = nextTournamentId;
    nextTournamentId += 1;

    let registration : TournamentRegistration = {
      id = registrationId;
      name;
      mobileNumber;
      hasPaid = false;
      registeredAt = Time.now();
      registeredBy = caller;
    };

    tournaments.add(registrationId, registration);
    registrationId;
  };

  // Confirm payment - admin only or self-confirm
  public shared ({ caller }) func confirmPayment(registrationId : Nat) : async () {
    switch (tournaments.get(registrationId)) {
      case (null) { Runtime.trap("Tournament not found.") };
      case (?registration) {
        // Allow admin or the user who registered to confirm payment
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != registration.registeredBy) {
          Runtime.trap("Unauthorized: Only admins or the registrant can confirm payment");
        };

        let updatedRegistration = {
          registration with hasPaid = true;
        };
        tournaments.add(registrationId, updatedRegistration);
      };
    };
  };

  // Get tournament questions - authenticated users only
  public query ({ caller }) func getTournamentQuestions() : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tournament questions");
    };

    let hardQuestions = questions.values().toArray().filter(
      func(q) { q.difficulty == #hard }
    );

    let allCategories = [
      #history,
      #politicalScience,
      #chemistry,
      #physics,
      #biology,
      #mathematics,
      #generalKnowledge,
      #logicalReasoning,
    ];

    var selected = List.empty<Question>();
    for (category in allCategories.values()) {
      let categoryQuestions = hardQuestions.filter(
        func(q) { q.category == category }
      );
      if (categoryQuestions.size() > 0) {
        selected.add(categoryQuestions[0]);
      };
    };

    selected.toArray();
  };

  // Submit tournament session - authenticated users only
  public shared ({ caller }) func submitTournamentSession(registrationId : Nat, answers : [Nat], score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit tournament sessions");
    };

    // Verify the registration exists and belongs to the caller
    switch (tournaments.get(registrationId)) {
      case (null) { Runtime.trap("Tournament registration not found.") };
      case (?registration) {
        if (registration.registeredBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only submit for your own registration");
        };

        if (not registration.hasPaid) {
          Runtime.trap("Payment not confirmed for this registration");
        };
      };
    };

    let session : TournamentSession = {
      registrationId;
      answers;
      score;
      completedAt = Time.now();
    };

    tournamentSessions.add(registrationId, session);
  };

  // Get tournament leaderboard - any user including guests
  public query ({ caller }) func getTournamentLeaderboard() : async [LeaderboardEntry] {
    var rank = 1;
    let entries = tournamentSessions.values().toArray().map(
      func(session) {
        let name = switch (tournaments.get(session.registrationId)) {
          case (null) { "" };
          case (?reg) { reg.name };
        };
        {
          rank;
          playerName = name;
          score = session.score;
        };
      }
    );
    let end = if (entries.size() < 10) { entries.size() } else { 10 };
    entries.sliceToArray(0, end);
  };

  // Award badge - admin only
  public shared ({ caller }) func awardBadge(user : Principal, badgeName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can award badges");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile does not exist.") };
      case (?profile) {
        let updatedProfile = {
          profile with badges = profile.badges.concat([badgeName]);
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Get daily challenge - any user including guests
  public query ({ caller }) func getDailyChallenge() : async ?Question {
    let allQuestions = questions.values().toArray();
    if (allQuestions.size() == 0) {
      return null;
    };

    let daysSinceEpoch = Time.now() / (24 * 60 * 60 * 1_000_000_000);
    let index = Int.abs(daysSinceEpoch) % allQuestions.size();
    ?allQuestions[index];
  };

  // Add question - admin only
  public shared ({ caller }) func addQuestion(
    category : QuestionCategory,
    difficulty : QuestionDifficulty,
    statements : [Text],
    lieIndex : Nat,
    explanation : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };

    let questionId = nextQuestionId;
    nextQuestionId += 1;

    let question : Question = {
      id = questionId;
      category;
      difficulty;
      statements;
      lieIndex;
      explanation;
    };

    questions.add(questionId, question);
    questionId;
  };
};
