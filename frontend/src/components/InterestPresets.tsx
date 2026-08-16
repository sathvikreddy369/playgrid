import { PHYSICAL_SPORTS_PRESETS, ESPORTS_PRESETS } from '../constants/sportsPresets';

interface InterestPresetsProps {
  selectedPhysical: string[];
  selectedEsports: string[];
  onChangePhysical: (sports: string[]) => void;
  onChangeEsports: (games: string[]) => void;
}

export default function InterestPresets({
  selectedPhysical,
  selectedEsports,
  onChangePhysical,
  onChangeEsports
}: InterestPresetsProps) {
  const togglePhysical = (sport: string) => {
    if (selectedPhysical.includes(sport)) {
      onChangePhysical(selectedPhysical.filter((s) => s !== sport));
    } else {
      onChangePhysical([...selectedPhysical, sport]);
    }
  };

  const toggleEsports = (game: string) => {
    if (selectedEsports.includes(game)) {
      onChangeEsports(selectedEsports.filter((g) => g !== game));
    } else {
      onChangeEsports([...selectedEsports, game]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Physical Sports */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            ⚽ Physical Sports Interests
          </label>
          <span className="text-[11px] text-zinc-500">{selectedPhysical.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PHYSICAL_SPORTS_PRESETS.map((sport) => {
            const isSelected = selectedPhysical.includes(sport);
            return (
              <button
                type="button"
                key={sport}
                onClick={() => togglePhysical(sport)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {isSelected ? `✓ ${sport}` : `+ ${sport}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* E-Sports & Gaming */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            🎮 E-Sports & Gaming Interests
          </label>
          <span className="text-[11px] text-zinc-500">{selectedEsports.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ESPORTS_PRESETS.map((game) => {
            const isSelected = selectedEsports.includes(game);
            return (
              <button
                type="button"
                key={game}
                onClick={() => toggleEsports(game)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-purple-600 border border-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {isSelected ? `✓ ${game}` : `+ ${game}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
