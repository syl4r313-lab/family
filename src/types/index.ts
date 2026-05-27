export type Role = 'parent' | 'child';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'chores' | 'homework' | 'errands' | 'fun' | 'health';
export type GoalType = 'vacation' | 'savings' | 'project' | 'challenge';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // emoji
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

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: GoalType;
  targetXP: number;
  currentXP: number;
  targetDate: string | null;
  completed: boolean;
  createdAt: string;
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
  members: FamilyMember[];
  quests: Quest[];
  goals: FamilyGoal[];
  rewards: Reward[];
  familyName: string;
  familyXP: number;
  familyLevel: number;
  addMember: (member: Omit<FamilyMember, 'id' | 'xp' | 'level' | 'streak' | 'completedQuests' | 'badges' | 'lastActiveDate'>) => void;
  addQuest: (quest: Omit<Quest, 'id' | 'completed' | 'completedAt' | 'completedBy' | 'createdAt'>) => void;
  completeQuest: (questId: string, memberId: string) => { xpGained: number; leveledUp: boolean; newLevel: number };
  addGoal: (goal: Omit<FamilyGoal, 'id' | 'currentXP' | 'completed' | 'createdAt'>) => void;
  contributeToGoal: (goalId: string, xp: number) => void;
  purchaseReward: (rewardId: string, memberId: string) => boolean;
  addReward: (reward: Omit<Reward, 'id'>) => void;
}
