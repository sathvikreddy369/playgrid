export const PHYSICAL_SPORTS_PRESETS = [
  'Cricket',
  'Football',
  'Badminton',
  'Basketball',
  'Tennis',
  'Volleyball',
  'Table Tennis',
  'Swimming',
  'Squash'
];

export const ESPORTS_PRESETS = [
  'BGMI',
  'Free Fire',
  'Valorant',
  'EA FC',
  'COD Mobile',
  'Rocket League',
  'Counter-Strike'
];

export const PRESET_AVATARS = [
  { id: 'avatar_01', emoji: '🧑‍🦱', label: 'Striker' },
  { id: 'avatar_02', emoji: '🧔', label: 'Captain' },
  { id: 'avatar_03', emoji: '👨‍🦰', label: 'Speedster' },
  { id: 'avatar_04', emoji: '👩‍🦰', label: 'Playmaker' },
  { id: 'avatar_05', emoji: '👱‍♂️', label: 'Keeper' },
  { id: 'avatar_06', emoji: '👨‍🎨', label: 'Tactician' },
  { id: 'avatar_07', emoji: '🥷', label: 'Ninja' },
  { id: 'avatar_08', emoji: '🧑‍🚀', label: 'Astro' },
  { id: 'avatar_09', emoji: '⚡', label: 'Blaze' },
  { id: 'avatar_10', emoji: '🤴', label: 'Champ' },
  { id: 'avatar_11', emoji: '🕵️‍♂️', label: 'Scout' },
  { id: 'avatar_12', emoji: '🧑‍🦲', label: 'Veteran' }
];

export function getAvatarEmoji(avatarId?: string | null): string {
  if (!avatarId) return '🧑‍🦱';
  const found = PRESET_AVATARS.find((a) => a.id === avatarId);
  return found ? found.emoji : '🧑‍🦱';
}
