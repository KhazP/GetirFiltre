import { useState, useMemo } from 'react';
import { Settings, Trash2, X, ChevronDown, ChevronUp, Star, ShoppingBag, MessageSquare, MapPin, Clock, Shield, Check, EyeOff } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import SettingsPage from './components/SettingsPage';
import { UserSettings, DEFAULT_SETTINGS } from '../shared/types';

type Page = 'main' | 'settings';

// ========== COMPONENTS DEFINED OUTSIDE TO PREVENT FOCUS LOSS ==========

interface CompactInputProps {
    icon: any;
    value: number | null;
    onChange: (v: number | null) => void;
    label: string;
    suffix: string;
    color: string;
    disabled: boolean;
    tooltip: string;
}

function CompactInput({ icon: Icon, value, onChange, label, suffix, color, disabled, tooltip }: CompactInputProps) {
    return (
        <div className={`bg-gf-dark-800 rounded-lg p-2.5 ${disabled ? 'opacity-50' : ''}`} title={tooltip}>
            <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-xs text-gray-400 truncate">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full bg-gf-dark-700 border border-gf-dark-600 rounded px-2 py-1 text-sm font-mono text-white
                        focus:outline-none focus:border-gf-accent-purple transition-all"
                    disabled={disabled}
                />
                {suffix && <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>}
            </div>
        </div>
    );
}

interface ChipToggleProps {
    label: string;
    active: boolean;
    onClick: () => void;
    disabled: boolean;
    tooltip: string;
    isHider?: boolean; // For section visibility toggles that "hide" things
}

function ChipToggle({ label, active, onClick, disabled, tooltip, isHider = false }: ChipToggleProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            className={`
                px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 flex items-center justify-center gap-1
                ${isHider
                    ? (active
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-gf-dark-700 text-gray-400 hover:bg-gf-dark-600 border border-transparent')
                    : (active
                        ? 'bg-gf-accent-purple text-white'
                        : 'bg-gf-dark-700 text-gray-400 hover:bg-gf-dark-600')
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {isHider && active && <EyeOff className="w-3 h-3" />}
            {!isHider && active && <Check className="w-3 h-3" />}
            {label}
        </button>
    );
}

// ========== MAIN APP ==========

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

    const isTabMode = useMemo(() => new URLSearchParams(window.location.search).has('page'), []);
    const [currentPage, setCurrentPage] = useState<Page>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('page') === 'settings' ? 'settings' : 'main';
    });
    const [showBlocklist, setShowBlocklist] = useState(false);

    const handleExport = () => {
        const exportData = { version: 1, exportedAt: new Date().toISOString(), settings };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
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

    const handleImport = async (importedSettings: UserSettings) => await replaceSettings(importedSettings);
    const handleReset = async () => await replaceSettings(DEFAULT_SETTINGS);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[300px] bg-gf-dark-900">
                <div className="animate-pulse text-gf-accent-purple">Yükleniyor...</div>
            </div>
        );
    }

    // Settings Page
    if (currentPage === 'settings') {
        return (
            <div className={isTabMode ? "min-h-screen bg-gf-dark-950 text-white" : "w-[340px] min-h-[400px] bg-gf-dark-900 text-white flex flex-col"}>
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
            </div>
        );
    }

    const content = (
        <>
            {/* Compact Header */}
            <header className="bg-gf-dark-800 px-3 py-2.5 border-b border-gf-dark-600">
                <div className="flex items-center justify-between">
                    <button onClick={toggleEnabled} className="flex items-center gap-2 group" title={settings.isEnabled ? 'Filtreleri kapat' : 'Filtreleri aç'}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${settings.isEnabled ? 'bg-gradient-to-br from-gf-accent-purple to-violet-700 shadow-lg shadow-gf-accent-purple/30' : 'bg-gf-dark-600'}`}>
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-bold text-sm ${settings.isEnabled ? 'text-white' : 'text-gray-500'}`}>GetirFiltre</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (chrome.tabs) {
                                    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
                                } else {
                                    window.open('../options/index.html', '_blank');
                                }
                            }}
                            className="p-1.5 rounded-lg hover:bg-gf-dark-700 transition-colors"
                            title="Gelişmiş ayarları yeni sekmede aç"
                        >
                            <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={toggleEnabled}
                            title={settings.isEnabled ? 'Filtreleri kapat' : 'Filtreleri aç'}
                            className={`relative w-10 h-5 rounded-full transition-all ${settings.isEnabled ? 'bg-gf-accent-purple shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-gf-dark-600'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="p-3 space-y-3">
                {/* 2x2 Filter Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <CompactInput
                        icon={Star}
                        value={settings.minRating}
                        onChange={(v) => updateSetting('minRating', v)}
                        label="Min Puan"
                        suffix="/5"
                        color="text-yellow-500"
                        disabled={!settings.isEnabled}
                        tooltip="Bu puanın altındaki restoranlar gizlenir"
                    />
                    <CompactInput
                        icon={ShoppingBag}
                        value={settings.maxMinBasket}
                        onChange={(v) => updateSetting('maxMinBasket', v)}
                        label="Max Sepet"
                        suffix="₺"
                        color="text-gf-accent-purple"
                        disabled={!settings.isEnabled}
                        tooltip="Bu tutarın üzerinde minimum sepet limiti olan restoranlar gizlenir"
                    />
                    <CompactInput
                        icon={MessageSquare}
                        value={settings.minReviewCount}
                        onChange={(v) => updateSetting('minReviewCount', v)}
                        label="Min Yorum"
                        suffix=""
                        color="text-blue-400"
                        disabled={!settings.isEnabled}
                        tooltip="Bu sayının altında yorumu olan restoranlar gizlenir"
                    />
                    <CompactInput
                        icon={MapPin}
                        value={settings.maxDistance}
                        onChange={(v) => updateSetting('maxDistance', v)}
                        label="Max Mesafe"
                        suffix="km"
                        color="text-red-400"
                        disabled={!settings.isEnabled}
                        tooltip="Bu mesafeden uzak restoranlar gizlenir"
                    />
                </div>

                {/* Delivery Time - Full Width */}
                <div className="bg-gf-dark-800 rounded-lg p-2.5" title="Bu süreden uzun teslimat süreleri olan restoranlar gizlenir">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-xs text-gray-400">Max Teslimat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                value={settings.maxDeliveryTime ?? ''}
                                onChange={(e) => updateSetting('maxDeliveryTime', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-16 bg-gf-dark-700 border border-gf-dark-600 rounded px-2 py-1 text-sm font-mono text-white text-right
                                    focus:outline-none focus:border-gf-accent-purple transition-all disabled:opacity-50"
                                disabled={!settings.isEnabled}
                            />
                            <span className="text-xs text-gray-500">dk</span>
                        </div>
                    </div>
                </div>

                {/* Toggle Chips Row - Feature toggles */}
                <div className="flex gap-1.5">
                    <ChipToggle
                        label="Kampanya"
                        active={settings.showOnlyPromotions}
                        onClick={() => updateSetting('showOnlyPromotions', !settings.showOnlyPromotions)}
                        disabled={!settings.isEnabled}
                        tooltip="Sadece kampanyalı restoranları göster"
                    />
                    <ChipToggle
                        label="Sponsor"
                        active={settings.hideSponsored}
                        onClick={() => updateSetting('hideSponsored', !settings.hideSponsored)}
                        disabled={!settings.isEnabled}
                        tooltip="Sponsorlu restoranları gizle"
                        isHider={true}
                    />
                </div>

                {/* Section Visibility Chips - These hide sections */}
                <div className="flex gap-1.5">
                    <ChipToggle
                        label="Karusel"
                        active={settings.hideCampaignCarousel}
                        onClick={() => updateSetting('hideCampaignCarousel', !settings.hideCampaignCarousel)}
                        disabled={!settings.isEnabled}
                        tooltip="Üst kampanya karuselini gizle"
                        isHider={true}
                    />
                    <ChipToggle
                        label="Müdavim"
                        active={settings.hideMudavimSection}
                        onClick={() => updateSetting('hideMudavimSection', !settings.hideMudavimSection)}
                        disabled={!settings.isEnabled}
                        tooltip="GetirYemek Müdavim bölümünü gizle"
                        isHider={true}
                    />
                    <ChipToggle
                        label="Açıktıysan"
                        active={settings.hideAciktiysanSection}
                        onClick={() => updateSetting('hideAciktiysanSection', !settings.hideAciktiysanSection)}
                        disabled={!settings.isEnabled}
                        tooltip="ACIKTIYSAN bölümünü gizle"
                        isHider={true}
                    />
                </div>

                {/* Blocked Restaurants - Collapsible */}
                <div className="bg-gf-dark-800 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowBlocklist(!showBlocklist)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gf-dark-700 transition-colors"
                        title="Engellediğiniz restoranların listesi"
                    >
                        <div className="flex items-center gap-2">
                            <X className="w-3.5 h-3.5 text-gf-accent-red" />
                            <span className="text-xs font-medium">Engellenen</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="bg-gf-dark-600 px-1.5 py-0.5 rounded text-xs font-mono">
                                {settings.blockedRestaurants.length}
                            </span>
                            {showBlocklist ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                    </button>
                    {showBlocklist && (
                        <div className="border-t border-gf-dark-600">
                            {settings.blockedRestaurants.length === 0 ? (
                                <p className="p-3 text-xs text-gray-500 text-center">Liste boş</p>
                            ) : (
                                <>
                                    <div className="max-h-[120px] overflow-y-auto">
                                        {settings.blockedRestaurants.map((slug) => (
                                            <div key={slug} className="flex items-center justify-between px-3 py-1.5 hover:bg-gf-dark-700">
                                                <span className="text-xs text-gray-300 truncate flex-1 mr-2">{formatSlug(slug)}</span>
                                                <button onClick={() => unblockRestaurant(slug)} className="text-gray-500 hover:text-gf-accent-red p-0.5" title="Engeli kaldır">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-gf-dark-600">
                                        <button
                                            onClick={clearBlocklist}
                                            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gf-accent-red/10 text-gf-accent-red rounded text-xs hover:bg-gf-accent-red/20 transition-colors"
                                            title="Tüm engelleri kaldır"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Temizle
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gf-dark-600 px-3 py-2 text-center mt-auto">
                <p className="text-[10px] text-gray-500">💡 Detaylı bilgi kutuların üzerine fare'yi tutun</p>
            </footer>
        </>
    );

    // Tab mode layout
    if (isTabMode) {
        return (
            <div className="min-h-screen bg-gf-dark-950 flex justify-center pt-12 pb-12 text-white">
                <div className="w-full max-w-sm bg-gf-dark-900 rounded-xl shadow-2xl overflow-hidden border border-gf-dark-600 flex flex-col h-fit">
                    {content}
                </div>
            </div>
        );
    }

    // Popup layout - centered
    return (
        <div className="w-[340px] bg-gf-dark-900 text-white flex flex-col mx-auto">
            {content}
        </div>
    );
}

function formatSlug(slug: string): string {
    return slug.split('-').slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
