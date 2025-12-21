import { useState, useMemo } from 'react';
import { Settings, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import SettingsPage from './components/SettingsPage';
import FilterSettings from './components/FilterSettings';
import { UserSettings, DEFAULT_SETTINGS } from '../shared/types';

type Page = 'main' | 'settings';

export default function App() {
    const {
        settings,
        isLoading,
        toggleEnabled,
        updateSetting,
        clearBlocklist,
        unblockRestaurant,
        replaceSettings,
    } = useSettings();

    // Check if running in full page mode (new tab)
    const isTabMode = useMemo(() => new URLSearchParams(window.location.search).has('page'), []);

    // Initialize page based on URL or default
    const [currentPage, setCurrentPage] = useState<Page>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('page') === 'settings' ? 'settings' : 'main';
    });

    const [showBlocklist, setShowBlocklist] = useState(false);

    // Export settings as JSON file
    const handleExport = () => {
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: settings,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);

        // Format filename: GetirFiltreYedekYYYYMMDDHHmm.json
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;

        const a = document.createElement('a');
        a.href = url;
        a.download = `GetirFiltreYedek${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import settings from uploaded data
    const handleImport = async (importedSettings: UserSettings) => {
        await replaceSettings(importedSettings);
    };

    // Reset to defaults
    const handleReset = async () => {
        await replaceSettings(DEFAULT_SETTINGS);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-gf-dark-900">
                <div className="animate-pulse text-gf-accent-purple">Yükleniyor...</div>
            </div>
        );
    }

    // Determine content to render
    const content = currentPage === 'settings' ? (
        <SettingsPage
            settings={settings}
            onBack={() => setCurrentPage('main')}
            unblockRestaurant={unblockRestaurant}
            clearBlocklist={clearBlocklist}
            onImport={handleImport}
            onExport={handleExport}
            onReset={handleReset}
            updateSetting={updateSetting}
            isTabMode={isTabMode}
        />
    ) : (
        <>
            {/* Header */}
            <header className="bg-gf-dark-800 p-4 border-b border-gf-dark-600">
                <div className="flex items-center justify-between">
                    {/* Clickable Logo - Toggle Extension */}
                    <button
                        onClick={toggleEnabled}
                        className="flex items-center gap-2 group"
                        title={settings.isEnabled ? 'Uzantıyı kapat' : 'Uzantıyı aç'}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 128 128"
                            className={`transition-all duration-200 ${settings.isEnabled
                                ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                : 'opacity-50 grayscale'
                                }`}
                        >
                            <defs>
                                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: settings.isEnabled ? '#a855f7' : '#6b7280' }} />
                                    <stop offset="100%" style={{ stopColor: settings.isEnabled ? '#7c3aed' : '#4b5563' }} />
                                </linearGradient>
                            </defs>
                            <rect width="128" height="128" rx="24" fill="url(#logo-gradient)" />
                            <path d="M40 36h48l-8 32H48l-8-32zm8 40h32v8H48v-8zm4 12h24v8H52v-8z" fill="white" />
                        </svg>
                        <h1 className={`font-bold text-lg transition-colors duration-200 ${settings.isEnabled ? 'text-white' : 'text-gray-500'
                            }`}>
                            GetirFiltre
                        </h1>
                    </button>

                    {/* Settings Gear - Open in New Tab if not in tab mode */}
                    <button
                        onClick={() => {
                            if (isTabMode) {
                                setCurrentPage('settings');
                            } else {
                                if (chrome.tabs) {
                                    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
                                } else {
                                    window.open('../options/index.html', '_blank');
                                }
                            }
                        }}
                        className="p-2 rounded-lg hover:bg-gf-dark-700 transition-colors group"
                        title="Ayarlar (Yeni Sekmede aç)"
                    >
                        <Settings className="w-5 h-5 text-gray-400 group-hover:text-gf-accent-purple transition-colors" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Gelişmiş Filtreleme Eklentisi
                </p>
            </header>

            {/* Main Content */}
            <main className="p-4 space-y-4">
                <FilterSettings
                    settings={settings}
                    updateSetting={updateSetting}
                    disabled={!settings.isEnabled}
                />

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
                                        {settings.blockedRestaurants.map((slug: string) => (
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
        </>
    );

    // Render Layout
    if (isTabMode) {
        if (currentPage === 'settings') {
            return (
                <div className="min-h-screen bg-gf-dark-950 text-white">
                    {content}
                </div>
            );
        }

        // Main view in tab mode - keep centered card
        return (
            <div className="min-h-screen bg-gf-dark-950 flex justify-center pt-12 pb-12 text-white">
                <div className="w-full max-w-md bg-gf-dark-900 rounded-xl shadow-2xl overflow-hidden border border-gf-dark-600 flex flex-col h-fit">
                    {content}
                </div>
            </div>
        );
    }

    // Popup Layout
    return (
        <div className="w-[320px] min-h-[400px] bg-gf-dark-900 text-white flex flex-col">
            {content}
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
