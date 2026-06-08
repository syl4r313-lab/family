import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, X, Check } from 'lucide-react';
import { useFamilyStore } from '../store/useFamilyStore';
import type { Role } from '../types';

const EMOJI_OPTIONS = ['👦', '👧', '👨', '👩', '🧑', '👴', '👵', '🧒', '🧔', '👩‍🦱', '👨‍🦱', '👩‍🦰', '👨‍🦳', '🧑‍🦳', '👩‍🦳'];

interface MemberDraft {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Onboarding() {
  const { setOnboarded, setFamilyName, addMember } = useFamilyStore();
  const [step, setStep] = useState(1);
  const [familyNameInput, setFamilyNameInput] = useState('');
  const [members, setMembers] = useState<MemberDraft[]>([
    { id: 'draft-1', name: '', role: 'parent', avatar: '👨' },
  ]);

  const addDraftMember = () => {
    if (members.length >= 8) return;
    setMembers((prev) => [
      ...prev,
      { id: `draft-${Date.now()}`, name: '', role: 'child', avatar: '👦' },
    ]);
  };

  const removeDraftMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateDraftMember = (id: string, updates: Partial<MemberDraft>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleFinish = () => {
    if (!familyNameInput.trim()) return;
    setFamilyName(familyNameInput.trim());
    members.forEach((m) => {
      if (m.name.trim()) {
        addMember({ name: m.name.trim(), avatar: m.avatar, avatarType: 'emoji', role: m.role });
      }
    });
    setOnboarded(true);
  };

  const canProceedStep2 = familyNameInput.trim().length > 0;
  const canProceedStep3 = members.some((m) => m.name.trim().length > 0);

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <motion.div
            key={s}
            animate={{
              width: s === step ? 24 : 8,
              backgroundColor: s <= step ? '#10B981' : '#E5E7EB',
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <div className="text-7xl mb-6">👨‍👩‍👧‍👦</div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">
                Willkommen bei FamilyQuest
              </h1>
              <p className="text-gray-500 text-lg mb-10">
                Organisiert eure Familie spielerisch
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                Los geht's
                <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🏠</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Wie heißt eure Familie?
                </h2>
                <p className="text-gray-500 text-sm">
                  Dieser Name erscheint auf eurem Dashboard
                </p>
              </div>

              <input
                type="text"
                value={familyNameInput}
                onChange={(e) => setFamilyNameInput(e.target.value)}
                placeholder="z.B. Familie Müller"
                className="input-field text-lg mb-8"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && canProceedStep2 && setStep(3)}
              />

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary px-4 py-3">
                  Zurück
                </button>
                <motion.button
                  whileHover={canProceedStep2 ? { scale: 1.02 } : {}}
                  whileTap={canProceedStep2 ? { scale: 0.98 } : {}}
                  onClick={() => canProceedStep2 && setStep(3)}
                  disabled={!canProceedStep2}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    canProceedStep2
                      ? 'btn-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Weiter
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Familienmitglieder
                </h2>
                <p className="text-gray-500 text-sm">
                  Wer gehört zu eurer Familie?
                </p>
              </div>

              <div className="space-y-3 mb-4 max-h-[40dvh] overflow-y-auto pr-1">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* Avatar */}
                      <div className="flex gap-1 flex-wrap w-32">
                        {EMOJI_OPTIONS.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => updateDraftMember(member.id, { avatar: emoji })}
                            className={`w-8 h-8 text-lg flex items-center justify-center rounded-lg transition-all ${
                              member.avatar === emoji
                                ? 'bg-emerald-100 ring-2 ring-emerald-500'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateDraftMember(member.id, { name: e.target.value })}
                          placeholder={`Mitglied ${index + 1}`}
                          className="input-field text-sm"
                        />
                      </div>

                      {members.length > 1 && (
                        <button
                          onClick={() => removeDraftMember(member.id)}
                          className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Role toggle */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateDraftMember(member.id, { role: 'parent' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          member.role === 'parent'
                            ? 'bg-purple-50 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        👑 Elternteil
                      </button>
                      <button
                        onClick={() => updateDraftMember(member.id, { role: 'child' })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          member.role === 'child'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        ⭐ Kind
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {members.length < 8 && (
                <button
                  onClick={addDraftMember}
                  className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2 mb-6"
                >
                  <Plus size={16} />
                  Mitglied hinzufügen
                </button>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary px-4 py-3">
                  Zurück
                </button>
                <motion.button
                  whileHover={canProceedStep3 ? { scale: 1.02 } : {}}
                  whileTap={canProceedStep3 ? { scale: 0.98 } : {}}
                  onClick={() => canProceedStep3 && setStep(4)}
                  disabled={!canProceedStep3}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    canProceedStep3
                      ? 'btn-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Weiter
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Eure Familie ist bereit!
              </h2>
              <p className="text-gray-500 mb-6">
                {familyNameInput} — bereit für Abenteuer
              </p>

              {/* Member avatar row */}
              <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                {members.filter((m) => m.name.trim()).map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-3xl">
                      {member.avatar}
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{member.name}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                <Check size={20} />
                App starten
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
