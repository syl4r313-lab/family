import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

const EMOJI_OPTIONS = [
  '👦', '👧', '👨', '👩', '🧑', '👴', '👵', '🧒', '🧔', '👩‍🦱',
  '👨‍🦱', '👩‍🦰', '👨‍🦳', '🧑‍🦳', '👩‍🦳', '🧑‍🎤', '🧑‍💻', '🧑‍🏫', '🧑‍🍳', '🧑‍🚀',
  '🦸', '🦹', '🧙', '🧚', '🧜', '🐻', '🐼', '🦊', '🐨', '🐯',
];

interface AvatarPickerProps {
  avatar: string;
  avatarType: 'emoji' | 'photo';
  onChange: (avatar: string, avatarType: 'emoji' | 'photo') => void;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No canvas context')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AvatarPicker({ avatar, avatarType, onChange }: AvatarPickerProps) {
  const [tab, setTab] = useState<'emoji' | 'photo'>(avatarType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, 200);
      onChange(dataUrl, 'photo');
      setTab('photo');
    } catch (err) {
      console.error('Image resize failed', err);
    }
    // Reset so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div>
      {/* Current avatar preview */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200 shadow-sm flex items-center justify-center bg-emerald-50">
          {avatarType === 'photo' ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">{avatar}</span>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        {(['emoji', 'photo'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'emoji' ? '😊 Emoji' : '📷 Foto'}
          </button>
        ))}
      </div>

      {tab === 'emoji' && (
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onChange(emoji, 'emoji')}
              className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl transition-all ${
                avatarType === 'emoji' && avatar === emoji
                  ? 'bg-emerald-100 ring-2 ring-emerald-500 scale-110'
                  : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {tab === 'photo' && (
        <div className="space-y-3">
          {avatarType === 'photo' && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <img src={avatar} alt="Aktuelles Foto" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-gray-700">Aktuelles Foto</p>
                <p className="text-xs text-gray-500">Neues Foto hochladen zum Ersetzen</p>
              </div>
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Upload size={16} />
            Foto hochladen
          </button>

          {/* Mobile camera button */}
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'user');
                fileInputRef.current.click();
              }
            }}
            className="w-full py-3 rounded-xl border border-gray-200 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium bg-white"
          >
            <Camera size={16} />
            Kamera
          </button>

          <p className="text-xs text-gray-400 text-center">
            Bild wird auf max. 200×200px verkleinert
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
