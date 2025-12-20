import { useState } from 'react';
import { Power, Filter, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from './hooks/useSettings';

export default function App() {
    const {
        settings,
        isLoading,
        toggleEnabled,
        updateSetting,
        clearBlocklist,
        unblockRestaurant,
    } = useSettings();

    const [showBlocklist, setShowBlocklist] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-gf-dark-900">
                <div className="animate-pulse text-gf-accent-purple">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="w-[320px] min-h-[400px] bg-gf-dark-900 text-white">
            {/* Header */}
            <header className="bg-gf-dark-800 p-4 border-b border-gf-dark-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gf-accent-purple" />
                        <h1 className="font-bold text-lg">GetirFiltre</h1>
                    </div>

                    {/* Master Toggle */}
                    <button
                        onClick={toggleEnabled}
                        className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${settings.isEnabled
                                ? 'bg-gf-accent-purple/20 text-gf-accent-purple border border-gf-accent-purple/50'
                                : 'bg-gf-dark-600 text-gray-400 border border-gf-dark-500'
                            }
            `}
                    >
                        <Power className="w-4 h-4" />
                        {settings.isEnabled ? 'Aktif' : 'Kapalı'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    GetirYemek için "God Mode" filtreleme
                </p>
            </header>

            {/* Main Content */}
            <main className="p-4 space-y-4">
                {/* Min Rating Filter */}
                <div className="bg-gf-dark-800 rounded-lg p-4">
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
                            disabled={!settings.isEnabled}
                            className={`
                flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                text-white placeholder-gray-500 font-mono text-sm
                focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        />
                        <span className="text-gray-500 text-sm">/ 5.0</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Bu puanın altındaki restoranlar gizlenir
                    </p>
                </div>

                {/* Max Min Basket Filter */}
                <div className="bg-gf-dark-800 rounded-lg p-4">
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
                            disabled={!settings.isEnabled}
                            className={`
                flex-1 bg-gf-dark-700 border border-gf-dark-500 rounded-lg px-3 py-2
                text-white placeholder-gray-500 font-mono text-sm
                focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        />
                        <span className="text-gray-500 text-sm">₺</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Bu limiti aşan minimum sepet tutarları gizlenir
                    </p>
                </div>

                {/* Blocklist Section */}
                <div className="bg-gf-dark-800 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowBlocklist(!showBlocklist)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gf-dark-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-gf-accent-red" />
                            <span className="font-medium">Engellenen Restoranlar</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-gf-dark-600 px-2 py-0.5 rounded-full text-xs font-mono">
                                {settings.blockedRestaurants.length}
                            </span>
                            {showBlocklist ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {showBlocklist && (
                        <div className="border-t border-gf-dark-600">
                            {settings.blockedRestaurants.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500 text-center">
                                    Henüz engellenmiş restoran yok
                                </p>
                            ) : (
                                <>
                                    <div className="max-h-[150px] overflow-y-auto">
                                        {settings.blockedRestaurants.map((slug) => (
                                            <div
                                                key={slug}
                                                className="flex items-center justify-between px-4 py-2 hover:bg-gf-dark-700"
                                            >
                                                <span className="text-sm text-gray-300 truncate flex-1 mr-2">
                                                    {formatSlug(slug)}
                                                </span>
                                                <button
                                                    onClick={() => unblockRestaurant(slug)}
                                                    className="text-gray-500 hover:text-gf-accent-purple transition-colors"
                                                    title="Engeli kaldır"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-3 border-t border-gf-dark-600">
                                        <button
                                            onClick={clearBlocklist}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 
                        bg-gf-accent-red/10 text-gf-accent-red rounded-lg
                        hover:bg-gf-accent-red/20 transition-colors text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Tümünü Temizle
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gf-dark-600 p-3 text-center">
                <p className="text-xs text-gray-500">
                    Sayfa yenilendikten sonra değişiklikler aktif olur
                </p>
            </footer>
        </div>
    );
}

/**
 * Format slug for display
 */
function formatSlug(slug: string): string {
    return slug
        .split('-')
        .slice(0, 3) // Take first 3 words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
