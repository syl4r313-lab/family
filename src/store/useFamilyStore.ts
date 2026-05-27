import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember, Quest, FamilyGoal, Reward, Badge, Difficulty } from '../types';

function calculateLevel(xp: number): number {
  return Math.min(50, Math.floor(Math.sqrt(xp / 50)) + 1);
}

function xpForNextLevel(level: number): number {
  return level * level * 50;
}

function getDifficultyXP(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 50;
    case 'medium': return 100;
    case 'hard': return 200;
  }
}

function checkBadges(member: FamilyMember): Badge[] {
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  const hasBadge = (id: string) => member.badges.some(b => b.id === id);

  if (member.completedQuests >= 1 && !hasBadge('first-quest')) {
    newBadges.push({ id: 'first-quest', name: 'Erste Quest', emoji: '⭐', description: 'Erste Quest abgeschlossen!', unlockedAt: now });
  }
  if (member.completedQuests >= 5 && !hasBadge('quest-5')) {
    newBadges.push({ id: 'quest-5', name: 'Quester', emoji: '🌟', description: '5 Quests abgeschlossen!', unlockedAt: now });
  }
  if (member.completedQuests >= 10 && !hasBadge('quest-10')) {
    newBadges.push({ id: 'quest-10', name: 'Quest-Meister', emoji: '💫', description: '10 Quests abgeschlossen!', unlockedAt: now });
  }
  if (member.completedQuests >= 25 && !hasBadge('quest-25')) {
    newBadges.push({ id: 'quest-25', name: 'Legende', emoji: '🏆', description: '25 Quests abgeschlossen!', unlockedAt: now });
  }
  if (member.xp >= 500 && !hasBadge('xp-500')) {
    newBadges.push({ id: 'xp-500', name: 'XP-Sammler', emoji: '💎', description: '500 XP gesammelt!', unlockedAt: now });
  }
  if (member.xp >= 1000 && !hasBadge('xp-1000')) {
    newBadges.push({ id: 'xp-1000', name: 'XP-Profi', emoji: '👑', description: '1000 XP gesammelt!', unlockedAt: now });
  }
  if (member.streak >= 3 && !hasBadge('streak-3')) {
    newBadges.push({ id: 'streak-3', name: 'Auf Kurs', emoji: '🔥', description: '3 Tage Streak!', unlockedAt: now });
  }
  if (member.streak >= 7 && !hasBadge('streak-7')) {
    newBadges.push({ id: 'streak-7', name: 'Woche durch!', emoji: '🌈', description: '7 Tage Streak!', unlockedAt: now });
  }
  if (member.level >= 5 && !hasBadge('level-5')) {
    newBadges.push({ id: 'level-5', name: 'Level 5', emoji: '🚀', description: 'Level 5 erreicht!', unlockedAt: now });
  }
  if (member.level >= 10 && !hasBadge('level-10')) {
    newBadges.push({ id: 'level-10', name: 'Level 10', emoji: '⚡', description: 'Level 10 erreicht!', unlockedAt: now });
  }

  return newBadges;
}

const defaultMembers: FamilyMember[] = [
  {
    id: 'papa',
    name: 'Papa',
    avatar: '👨',
    role: 'parent',
    xp: 450,
    level: calculateLevel(450),
    streak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedQuests: 9,
    badges: [
      { id: 'first-quest', name: 'Erste Quest', emoji: '⭐', description: 'Erste Quest abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'quest-5', name: 'Quester', emoji: '🌟', description: '5 Quests abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'streak-3', name: 'Auf Kurs', emoji: '🔥', description: '3 Tage Streak!', unlockedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'mama',
    name: 'Mama',
    avatar: '👩',
    role: 'parent',
    xp: 520,
    level: calculateLevel(520),
    streak: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedQuests: 11,
    badges: [
      { id: 'first-quest', name: 'Erste Quest', emoji: '⭐', description: 'Erste Quest abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'quest-5', name: 'Quester', emoji: '🌟', description: '5 Quests abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'quest-10', name: 'Quest-Meister', emoji: '💫', description: '10 Quests abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'xp-500', name: 'XP-Sammler', emoji: '💎', description: '500 XP gesammelt!', unlockedAt: new Date().toISOString() },
      { id: 'streak-3', name: 'Auf Kurs', emoji: '🔥', description: '3 Tage Streak!', unlockedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'tim',
    name: 'Tim',
    avatar: '👦',
    role: 'child',
    xp: 320,
    level: calculateLevel(320),
    streak: 2,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedQuests: 7,
    badges: [
      { id: 'first-quest', name: 'Erste Quest', emoji: '⭐', description: 'Erste Quest abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'quest-5', name: 'Quester', emoji: '🌟', description: '5 Quests abgeschlossen!', unlockedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'lena',
    name: 'Lena',
    avatar: '👧',
    role: 'child',
    xp: 280,
    level: calculateLevel(280),
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedQuests: 5,
    badges: [
      { id: 'first-quest', name: 'Erste Quest', emoji: '⭐', description: 'Erste Quest abgeschlossen!', unlockedAt: new Date().toISOString() },
      { id: 'quest-5', name: 'Quester', emoji: '🌟', description: '5 Quests abgeschlossen!', unlockedAt: new Date().toISOString() },
    ],
  },
];

const defaultQuests: Quest[] = [
  {
    id: 'q1',
    title: 'Zimmer aufräumen',
    description: 'Spielzeug wegräumen, Boden fegen und Schreibtisch aufräumen',
    assigneeId: 'tim',
    xpReward: 50,
    difficulty: 'easy',
    category: 'chores',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q2',
    title: 'Hausaufgaben machen',
    description: 'Mathe und Deutsch Hausaufgaben vollständig erledigen',
    assigneeId: 'lena',
    xpReward: 100,
    difficulty: 'medium',
    category: 'homework',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q3',
    title: 'Einkaufen gehen',
    description: 'Wocheneinkauf im Supermarkt erledigen',
    assigneeId: 'mama',
    xpReward: 100,
    difficulty: 'medium',
    category: 'errands',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q4',
    title: 'Rasen mähen',
    description: 'Den Garten in Ordnung bringen und Rasen mähen',
    assigneeId: 'papa',
    xpReward: 200,
    difficulty: 'hard',
    category: 'chores',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q5',
    title: 'Fahrrad fahren',
    description: '30 Minuten Fahrrad fahren für Bewegung',
    assigneeId: null,
    xpReward: 50,
    difficulty: 'easy',
    category: 'health',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q6',
    title: 'Familienspiel-Abend',
    description: 'Brettspiel zusammen spielen und Spaß haben',
    assigneeId: null,
    xpReward: 50,
    difficulty: 'easy',
    category: 'fun',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q7',
    title: 'Mathe üben',
    description: 'Einmaleins bis 10 auswendig lernen',
    assigneeId: 'tim',
    xpReward: 100,
    difficulty: 'medium',
    category: 'homework',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q8',
    title: 'Küche putzen',
    description: 'Küche gründlich sauber machen, inkl. Herd und Spüle',
    assigneeId: null,
    xpReward: 200,
    difficulty: 'hard',
    category: 'chores',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
  },
];

const defaultGoals: FamilyGoal[] = [
  {
    id: 'g1',
    title: 'Sommerurlaub',
    description: 'Zusammen Urlaub machen und eine tolle Zeit verbringen',
    emoji: '🏖️',
    type: 'vacation',
    targetXP: 2000,
    currentXP: 850,
    targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g2',
    title: 'Neues Fahrrad',
    description: 'Für Tim ein neues Fahrrad ersparen',
    emoji: '🚲',
    type: 'savings',
    targetXP: 1500,
    currentXP: 620,
    targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g3',
    title: 'Familienfilm-Abend',
    description: 'Einen ganzen Abend zusammen Filme schauen mit Popcorn',
    emoji: '🎬',
    type: 'challenge',
    targetXP: 500,
    currentXP: 380,
    targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const defaultRewards: Reward[] = [
  {
    id: 'r1',
    title: 'Extra Bildschirmzeit',
    description: '1 Stunde mehr Spielzeit oder TV',
    emoji: '📱',
    xpCost: 150,
    available: true,
  },
  {
    id: 'r2',
    title: 'Abendessen aussuchen',
    description: 'Du darfst das Abendessen für die ganze Familie aussuchen',
    emoji: '🍕',
    xpCost: 100,
    available: true,
  },
  {
    id: 'r3',
    title: 'Pflicht überspringen',
    description: 'Eine Pflicht deiner Wahl überspringen',
    emoji: '🎫',
    xpCost: 200,
    available: true,
  },
  {
    id: 'r4',
    title: 'Kinoabend',
    description: 'Familienausflug ins Kino',
    emoji: '🎬',
    xpCost: 500,
    available: true,
  },
  {
    id: 'r5',
    title: 'Lieblingsessen',
    description: 'Dein Lieblingsessen zum Mittagessen',
    emoji: '🍔',
    xpCost: 80,
    available: true,
  },
  {
    id: 'r6',
    title: 'Übernachtungsparty',
    description: 'Einen Freund einladen zum Übernachten',
    emoji: '🌙',
    xpCost: 300,
    available: true,
  },
];

interface StoreState {
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

export const useFamilyStore = create<StoreState>()(
  persist(
    (set, get) => ({
      members: defaultMembers,
      quests: defaultQuests,
      goals: defaultGoals,
      rewards: defaultRewards,
      familyName: 'Die Mustermanns',
      familyXP: defaultMembers.reduce((sum, m) => sum + m.xp, 0),
      familyLevel: 1,

      addMember: (memberData) => {
        const newMember: FamilyMember = {
          ...memberData,
          id: `member-${Date.now()}`,
          xp: 0,
          level: 1,
          streak: 0,
          lastActiveDate: '',
          completedQuests: 0,
          badges: [],
        };
        set((state) => ({ members: [...state.members, newMember] }));
      },

      addQuest: (questData) => {
        const newQuest: Quest = {
          ...questData,
          id: `quest-${Date.now()}`,
          completed: false,
          completedAt: null,
          completedBy: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ quests: [...state.quests, newQuest] }));
      },

      completeQuest: (questId: string, memberId: string) => {
        const state = get();
        const quest = state.quests.find(q => q.id === questId);
        const member = state.members.find(m => m.id === memberId);

        if (!quest || !member || quest.completed) {
          return { xpGained: 0, leveledUp: false, newLevel: member?.level ?? 1 };
        }

        const xpGained = quest.xpReward;
        const oldLevel = member.level;
        const newXP = member.xp + xpGained;
        const newLevel = calculateLevel(newXP);
        const leveledUp = newLevel > oldLevel;

        const today = new Date().toISOString().split('T')[0];
        const lastActive = member.lastActiveDate;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastActive === yesterday ? member.streak + 1 : lastActive === today ? member.streak : 1;

        const updatedMember: FamilyMember = {
          ...member,
          xp: newXP,
          level: newLevel,
          streak: newStreak,
          lastActiveDate: today,
          completedQuests: member.completedQuests + 1,
          badges: member.badges,
        };

        const newBadges = checkBadges(updatedMember);
        updatedMember.badges = [...updatedMember.badges, ...newBadges];

        const newFamilyXP = state.familyXP + xpGained;
        const newFamilyLevel = calculateLevel(newFamilyXP / 4); // Average

        set((s) => ({
          quests: s.quests.map(q =>
            q.id === questId
              ? { ...q, completed: true, completedAt: new Date().toISOString(), completedBy: memberId }
              : q
          ),
          members: s.members.map(m => m.id === memberId ? updatedMember : m),
          familyXP: newFamilyXP,
          familyLevel: newFamilyLevel,
        }));

        // Auto-contribute XP to the nearest goal
        const activeGoals = get().goals.filter(g => !g.completed);
        if (activeGoals.length > 0) {
          const goalToContribute = activeGoals.sort((a, b) => (b.currentXP / b.targetXP) - (a.currentXP / a.targetXP))[0];
          get().contributeToGoal(goalToContribute.id, Math.floor(xpGained * 0.1));
        }

        return { xpGained, leveledUp, newLevel };
      },

      addGoal: (goalData) => {
        const newGoal: FamilyGoal = {
          ...goalData,
          id: `goal-${Date.now()}`,
          currentXP: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },

      contributeToGoal: (goalId: string, xp: number) => {
        set((state) => ({
          goals: state.goals.map(g => {
            if (g.id !== goalId || g.completed) return g;
            const newCurrentXP = Math.min(g.currentXP + xp, g.targetXP);
            return { ...g, currentXP: newCurrentXP, completed: newCurrentXP >= g.targetXP };
          }),
        }));
      },

      purchaseReward: (rewardId: string, memberId: string) => {
        const state = get();
        const reward = state.rewards.find(r => r.id === rewardId);
        const member = state.members.find(m => m.id === memberId);

        if (!reward || !member || !reward.available || member.xp < reward.xpCost) {
          return false;
        }

        set((s) => ({
          members: s.members.map(m =>
            m.id === memberId ? { ...m, xp: m.xp - reward.xpCost } : m
          ),
        }));

        return true;
      },

      addReward: (rewardData) => {
        const newReward: Reward = {
          ...rewardData,
          id: `reward-${Date.now()}`,
        };
        set((state) => ({ rewards: [...state.rewards, newReward] }));
      },
    }),
    {
      name: 'family-quest-storage',
    }
  )
);

export { calculateLevel, xpForNextLevel, getDifficultyXP };
