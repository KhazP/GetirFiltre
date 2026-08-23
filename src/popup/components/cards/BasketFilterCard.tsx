import { UserSettings, UpdateSetting } from '../../../shared/types';

interface CardProps {
    settings: UserSettings;
    updateSetting: UpdateSetting;
    disabled?: boolean;
    variant?: 'default' | 'compact';
}

export default function BasketFilterCard({ settings, updateSetting, disabled, variant = 'default' }: CardProps) {
    const content = (
        <div className="flex items-center gap-3">
            <input
                type="number"
                min="0"
                step="10"
                value={settings.maxMinBasket ?? ''}
                onChange={(e) => {
                    const val = e.target.value;
                    updateSetting('maxMinBasket', val ? parseInt(val, 10) : null);
                }}
                placeholder="örn: 300"
                disabled={disabled}
                className="flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                    text-white placeholder-gray-500 font-mono text-sm
                    focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <span className="text-gray-500 text-sm">₺</span>
        </div>
    );

    if (variant === 'compact') {
        return (
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">Maksimum Sepet Limiti</label>
                {content}
                <p className="text-xs text-gray-500 mt-1">Bu limiti aşan minimum sepet tutarları gizlenir</p>
            </div>
        );
    }

    return content;
}

