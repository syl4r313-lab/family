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

export const useFamilyStore = create<StoreState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      members: [],
      quests: [],
      goals: [],
      rewards: defaultRewards,
      familyName: '',
      familyXP: 0,
      familyLevel: 1,

      setOnboarded: (value: boolean) => {
        set({ isOnboarded: value });
      },

      setFamilyName: (name: string) => {
        set({ familyName: name });
      },

      addMember: (memberData) => {
        const newMember: FamilyMember = {
          ...memberData,
          id: `member-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          xp: 0,
          level: 1,
          streak: 0,
          lastActiveDate: '',
          completedQuests: 0,
          badges: [],
        };
        set((state) => ({ members: [...state.members, newMember] }));
      },

      updateMember: (id: string, updates: Partial<FamilyMember>) => {
        set((state) => ({
          members: state.members.map(m => m.id === id ? { ...m, ...updates } : m),
        }));
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
        const newFamilyLevel = calculateLevel(newFamilyXP / 4);

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

        return { xpGained, leveledUp, newLevel };
      },

      addGoal: (goalData) => {
        const newGoal: FamilyGoal = {
          ...goalData,
          id: `goal-${Date.now()}`,
          currentAmount: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          contributions: [],
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },

      contributeToGoal: (goalId: string, amount: number, note: string, contributorId: string | null) => {
        const state = get();
        set((s) => ({
          goals: s.goals.map(g => {
            if (g.id !== goalId || g.completed) return g;
            const newCurrentAmount = Math.min(g.currentAmount + amount, g.targetAmount);
            const nowCompleted = newCurrentAmount >= g.targetAmount;
            const contribution = {
              id: `contrib-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              amount,
              note,
              contributorId,
              date: new Date().toISOString(),
            };
            return {
              ...g,
              currentAmount: newCurrentAmount,
              completed: nowCompleted,
              contributions: [...g.contributions, contribution],
            };
          }),
        }));

        // Award XP bonus on completion
        const updatedGoal = get().goals.find(g => g.id === goalId);
        if (updatedGoal?.completed && updatedGoal.xpBonusOnComplete > 0) {
          const members = get().members;
          if (contributorId) {
            const member = members.find(m => m.id === contributorId);
            if (member) {
              const newXP = member.xp + updatedGoal.xpBonusOnComplete;
              const newLevel = calculateLevel(newXP);
              set((s) => ({
                members: s.members.map(m =>
                  m.id === contributorId
                    ? { ...m, xp: newXP, level: newLevel }
                    : m
                ),
                familyXP: state.familyXP + updatedGoal.xpBonusOnComplete,
              }));
            }
          } else {
            // Award to all members
            const bonusEach = Math.floor(updatedGoal.xpBonusOnComplete / Math.max(members.length, 1));
            set((s) => ({
              members: s.members.map(m => {
                const newXP = m.xp + bonusEach;
                return { ...m, xp: newXP, level: calculateLevel(newXP) };
              }),
              familyXP: state.familyXP + updatedGoal.xpBonusOnComplete,
            }));
          }
        }
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
      name: 'family-quest-storage-v2',
    }
  )
);

export { calculateLevel, xpForNextLevel, getDifficultyXP };
