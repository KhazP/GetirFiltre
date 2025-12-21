import { UserSettings } from '../../shared/types';

interface FilterSettingsProps {
    settings: UserSettings;
    updateSetting: (key: keyof UserSettings, value: any) => Promise<void>;
    disabled?: boolean;
}

export default function FilterSettings({
    settings,
    updateSetting,
    disabled = false
}: FilterSettingsProps) {
    return (
        <div className="space-y-4">
            {/* Min Rating Filter */}
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Puan
                </label>
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
                        className={`
                            flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                            text-white placeholder-gray-500 font-mono text-sm
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all
                        `}
                    />
                    <span className="text-gray-500 text-sm">/ 5.0</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Bu puanın altındaki restoranlar gizlenir
                </p>
            </div>

            {/* Max Min Basket Filter */}
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maksimum Sepet Limiti
                </label>
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
                        className={`
                            flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                            text-white placeholder-gray-500 font-mono text-sm
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all
                        `}
                    />
                    <span className="text-gray-500 text-sm">₺</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Bu limiti aşan minimum sepet tutarları gizlenir
                </p>
            </div>

            {/* Min Review Count Filter */}
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Değerlendirme Sayısı
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="0"
                        step="50"
                        value={settings.minReviewCount ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateSetting('minReviewCount', val ? parseInt(val, 10) : null);
                        }}
                        placeholder="örn: 500"
                        disabled={disabled}
                        className={`
                            flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                            text-white placeholder-gray-500 font-mono text-sm
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all
                        `}
                    />
                    <span className="text-gray-500 text-sm">yorum</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Bu sayının altında yorumu olan restoranlar gizlenir
                </p>
            </div>

            {/* Max Distance Filter */}
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maksimum Mesafe
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={settings.maxDistance ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateSetting('maxDistance', val ? parseFloat(val) : null);
                        }}
                        placeholder="örn: 2.5"
                        disabled={disabled}
                        className={`
                            flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                            text-white placeholder-gray-500 font-mono text-sm
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all
                        `}
                    />
                    <span className="text-gray-500 text-sm">km</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Bu mesafeden uzak restoranlar gizlenir
                </p>
            </div>

            {/* Max Delivery Time Filter */}
            <div className="bg-gf-dark-800 rounded-lg p-4 transition-colors hover:bg-gf-dark-750">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maksimum Teslimat Süresi
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="0"
                        step="5"
                        value={settings.maxDeliveryTime ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateSetting('maxDeliveryTime', val ? parseInt(val, 10) : null);
                        }}
                        placeholder="örn: 45"
                        disabled={disabled}
                        className={`
                            flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                            text-white placeholder-gray-500 font-mono text-sm
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all
                        `}
                    />
                    <span className="text-gray-500 text-sm">dk</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Bu süreden uzun teslimat süreleri gizlenir
                </p>
            </div>

            {/* Toggle Filters Section */}
            <div className="bg-gf-dark-800 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Diğer Filtreler</h3>

                {/* Show Only Promotions Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-gray-300">Sadece Kampanyalı</span>
                        <p className="text-xs text-gray-500">
                            Sadece kampanyalı restoranları göster
                        </p>
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
                        <span
                            className={`
                                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                                ${settings.showOnlyPromotions ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>

                {/* Hide Sponsored Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-gray-300">Sponsorluları Gizle</span>
                        <p className="text-xs text-gray-500">
                            Sponsorlu restoranları gizle
                        </p>
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
                        <span
                            className={`
                                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                                ${settings.hideSponsored ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

