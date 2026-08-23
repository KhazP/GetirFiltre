import { Tag, EyeOff } from 'lucide-react';
import { UserSettings, UpdateSetting } from '../../../shared/types';

interface CardProps {
    settings: UserSettings;
    updateSetting: UpdateSetting;
    disabled?: boolean;
    variant?: 'default' | 'compact';
}

export default function TogglesCard({ settings, updateSetting, disabled, variant = 'default' }: CardProps) {
    const content = (
        <div className="space-y-4">
            {/* Show Only Promotions Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {variant === 'default' && <div className="p-2 bg-pink-500/10 rounded-lg"><Tag className="w-4 h-4 text-pink-500" /></div>}
                    <div>
                        <span className="text-sm text-gray-300 block">Sadece Kampanyalı</span>
                        <p className="text-xs text-gray-500">Sadece kampanyalı restoranları göster</p>
                    </div>
                </div>
                <button
                    onClick={() => updateSetting('showOnlyPromotions', !settings.showOnlyPromotions)}
                    disabled={disabled}
                    className={`
                        relative w-11 h-6 rounded-full transition-colors
                        ${settings.showOnlyPromotions ? 'bg-gf-accent-purple' : 'bg-gf-dark-600'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <span className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                        ${settings.showOnlyPromotions ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                </button>
            </div>

            {/* Hide Sponsored Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {variant === 'default' && <div className="p-2 bg-blue-500/10 rounded-lg"><EyeOff className="w-4 h-4 text-blue-500" /></div>}
                    <div>
                        <span className="text-sm text-gray-300 block">Sponsorluları Gizle</span>
                        <p className="text-xs text-gray-500">Sponsorlu restoranları gizle</p>
                    </div>
                </div>
                <button
                    onClick={() => updateSetting('hideSponsored', !settings.hideSponsored)}
                    disabled={disabled}
                    className={`
                        relative w-11 h-6 rounded-full transition-colors
                        ${settings.hideSponsored ? 'bg-gf-accent-purple' : 'bg-gf-dark-600'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <span className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                        ${settings.hideSponsored ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                </button>
            </div>
        </div>
    );

    if (variant === 'compact') {
        return (
            <div className="bg-gf-dark-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Diğer Filtreler</h3>
                {content}
            </div>
        );
    }

    return content;
}

