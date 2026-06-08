import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import type { FamilyMember, Role } from '../types';
import { useFamilyStore } from '../store/useFamilyStore';
import AvatarPicker from './AvatarPicker';

interface EditMemberModalProps {
  member: FamilyMember | null | undefined;  // null = new, FamilyMember = edit, undefined = closed
  onClose: () => void;
}

export default function EditMemberModal({ member, onClose }: EditMemberModalProps) {
  const { updateMember, addMember } = useFamilyStore();

  // member === undefined means modal is closed
  // member === null means new member
  // member === FamilyMember means editing
  const isOpen = member !== undefined;
  const isNew = member === null;
  const [name, setName] = useState(member?.name ?? '');
  const [role, setRole] = useState<Role>(member?.role ?? 'child');
  const [avatar, setAvatar] = useState(member?.avatar ?? '👤');
  const [avatarType, setAvatarType] = useState<'emoji' | 'photo'>(member?.avatarType ?? 'emoji');

  const handleSave = () => {
    if (!name.trim()) return;
    if (isNew || !member) {
      addMember({ name: name.trim(), avatar, avatarType, role });
    } else {
      updateMember(member.id, { name: name.trim(), role, avatar, avatarType });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40" />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isNew ? 'Mitglied hinzufügen' : 'Profil bearbeiten'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {isNew ? 'Neues Familienmitglied' : member.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Avatar picker */}
              <AvatarPicker
                avatar={avatar}
                avatarType={avatarType}
                onChange={(a, t) => { setAvatar(a); setAvatarType(t); }}
              />

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name eingeben..."
                  className="input-field"
                  autoFocus={isNew}
                />
              </div>

              {/* Role toggle */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Rolle</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRole('parent')}
                    className={`flex-1 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                      role === 'parent'
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    👑 Elternteil
                  </button>
                  <button
                    onClick={() => setRole('child')}
                    className={`flex-1 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                      role === 'child'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    ⭐ Kind
                  </button>
                </div>
              </div>

              {/* Save */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!name.trim()}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  name.trim()
                    ? 'btn-primary'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                {isNew ? 'Zur Familie hinzufügen' : 'Änderungen speichern'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
