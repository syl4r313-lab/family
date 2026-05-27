export type Role = 'parent' | 'child';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'chores' | 'homework' | 'errands' | 'fun' | 'health';
export type GoalType = 'vacation' | 'savings' | 'purchase' | 'project' | 'challenge';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // emoji string OR "data:image/..." base64 string
  avatarType: 'emoji' | 'photo';
  role: Role;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedQuests: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null; // null = any member
  xpReward: number;
  difficulty: Difficulty;
  category: Category;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  amount: number; // € amount
  note: string;
  contributorId: string | null; // family member who contributed (or null = family)
  date: string;
}

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: GoalType;

  // Money tracking (primary)
  targetAmount: number; // e.g. 2000 (€)
  currentAmount: number; // e.g. 450 (€ contributed so far)

  // XP bonus (secondary, gamification)
  xpBonusOnComplete: number; // XP reward when goal is reached

  targetDate: string | null;
  completed: boolean;
  createdAt: string;
  contributions: GoalContribution[];
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpCost: number;
  available: boolean;
}

export interface FamilyStore {
  isOnboarded: boolean;
  members: FamilyMember[];
  quests: Quest[];
  goals: FamilyGoal[];
  rewards: Reward[];
  familyName: string;
  familyXP: number;
  familyLevel: number;
  setOnboarded: (value: boolean) => void;
  setFamilyName: (name: string) => void;
  addMember: (member: Omit<FamilyMember, 'id' | 'xp' | 'level' | 'streak' | 'completedQuests' | 'badges' | 'lastActiveDate'>) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  addQuest: (quest: Omit<Quest, 'id' | 'completed' | 'completedAt' | 'completedBy' | 'createdAt'>) => void;
  completeQuest: (questId: string, memberId: string) => { xpGained: number; leveledUp: boolean; newLevel: number };
  addGoal: (goal: Omit<FamilyGoal, 'id' | 'currentAmount' | 'completed' | 'createdAt' | 'contributions'>) => void;
  contributeToGoal: (goalId: string, amount: number, note: string, contributorId: string | null) => void;
  purchaseReward: (rewardId: string, memberId: string) => boolean;
  addReward: (reward: Omit<Reward, 'id'>) => void;
}
