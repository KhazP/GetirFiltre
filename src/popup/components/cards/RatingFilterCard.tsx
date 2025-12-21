import { UserSettings } from '../../../shared/types';


interface CardProps {
    settings: UserSettings;
    updateSetting: (key: keyof UserSettings, value: any) => Promise<void>;
    disabled?: boolean;
    variant?: 'default' | 'compact';
}

export default function RatingFilterCard({ settings, updateSetting, disabled, variant = 'default' }: CardProps) {
    const content = (
        <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={settings.minRating ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        updateSetting('minRating', val ? parseFloat(val) : null);
                    }}
                    placeholder="örn: 4.2"
                    disabled={disabled}
                    className="flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                        text-white placeholder-gray-500 font-mono text-sm
                        focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                        disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <span className="text-gray-500 text-sm whitespace-nowrap">/ 5.0</span>
            </div>
            {variant === 'default' && (
                <div className="w-full bg-gf-dark-700 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${((settings.minRating || 0) / 5) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );

    if (variant === 'compact') {
        return (
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Puan</label>
                {content}
                <p className="text-xs text-gray-500 mt-1">Bu puanın altındaki restoranlar gizlenir</p>
            </div>
        );
    }

    // For 'default' variant, return just the content. 
    // The parent (SettingsPage) wraps this in BentoCard.
    return content;
}

