import { PRESET_AVATARS } from '../constants/sportsPresets';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
}

export default function AvatarSelector({ selectedAvatarId, onSelectAvatar }: AvatarSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-400">Choose Profile Avatar</label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
        {PRESET_AVATARS.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          return (
            <button
              type="button"
              key={avatar.id}
              onClick={() => onSelectAvatar(avatar.id)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50 scale-105'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span className="text-2xl mb-1">{avatar.emoji}</span>
              <span className="text-[10px] font-bold tracking-tight truncate w-full text-center">
                {avatar.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
