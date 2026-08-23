import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Clock, EyeOff, LucideIcon, MapPin, MessageSquare, Settings, Shield, ShoppingBag, Star, Tag, Trash2, X } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { useActivePlatform } from './hooks/useActivePlatform';
import SettingsPage from './components/SettingsPage';
import BlockedKeywordsCard from './components/cards/BlockedKeywordsCard';
import { UserSettings, DEFAULT_SETTINGS } from '../shared/types';

type Page = 'main' | 'settings';

// ========== COMPONENTS DEFINED OUTSIDE TO PREVENT FOCUS LOSS ==========

interface CompactInputProps {
    icon: LucideIcon;
    value: number | null;
    onChange: (v: number | null) => void;
    label: string;
    suffix: string;
    color: string;
    disabled: boolean;
    tooltip: string;
}

function CompactInput({ icon: Icon, value, onChange, label, suffix, color, disabled, tooltip }: CompactInputProps) {
    const [localValue, setLocalValue] = useState<string>(() => value !== null ? value.toString() : '');

    // Keep local value synced with external props
    useEffect(() => {
        setLocalValue(value !== null ? value.toString() : '');
    }, [value]);

    const handleCommit = () => {
        const parsed = localValue !== '' ? parseFloat(localValue) : null;
        if (parsed !== value) {
            onChange(parsed);
        }
    };

    return (
        <div className={`bg-gf-dark-800 rounded-lg p-2.5 ${disabled ? 'opacity-50' : ''}`} title={tooltip}>
            <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-xs text-gray-400 truncate">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleCommit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleCommit();
                        }
                    }}
                    className="w-full min-w-0 bg-gf-dark-700 border border-gf-dark-600 rounded px-2 py-1 text-sm font-mono text-white
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
                px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 flex items-center justify-center gap-1 min-w-0
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
            {isHider && active && <EyeOff className="w-3 h-3 flex-shrink-0" />}
            {!isHider && active && <Check className="w-3 h-3 flex-shrink-0" />}
            <span className="truncate">{label}</span>
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
        blockKeyword,
        unblockKeyword,
        replaceSettings,
    } = useSettings();

    const { platform, isOnSite, has } = useActivePlatform();

    const [localMaxDeliveryTime, setLocalMaxDeliveryTime] = useState<string>(() =>
        settings?.maxDeliveryTime !== null && settings?.maxDeliveryTime !== undefined 
            ? settings.maxDeliveryTime.toString() 
            : ''
    );

    useEffect(() => {
        setLocalMaxDeliveryTime(
            settings?.maxDeliveryTime !== null && settings?.maxDeliveryTime !== undefined 
                ? settings.maxDeliveryTime.toString() 
                : ''
        );
    }, [settings?.maxDeliveryTime]);

    const handleCommitMaxDeliveryTime = () => {
        const parsed = localMaxDeliveryTime !== '' ? parseInt(localMaxDeliveryTime, 10) : null;
        if (parsed !== settings.maxDeliveryTime) {
            updateSetting('maxDeliveryTime', parsed);
        }
    };

    const isTabMode = useMemo(() => new URLSearchParams(window.location.search).has('page'), []);
    const [currentPage, setCurrentPage] = useState<Page>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('page') === 'settings' ? 'settings' : 'main';
    });
    const [showBlocklist, setShowBlocklist] = useState(false);
    const [showKeywords, setShowKeywords] = useState(false);

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

    // Controls are declared once and filtered by what the active site supports
    const numericFilters = ([
        { key: 'minRating', icon: Star, label: 'Min Puan', suffix: '/5', color: 'text-yellow-500', tooltip: 'Bu puanın altındaki restoranlar gizlenir' },
        { key: 'maxMinBasket', icon: ShoppingBag, label: 'Max Sepet', suffix: '₺', color: 'text-gf-accent-purple', tooltip: 'Bu tutarın üzerinde minimum sepet limiti olan restoranlar gizlenir' },
        { key: 'minReviewCount', icon: MessageSquare, label: 'Min Yorum', suffix: '', color: 'text-blue-400', tooltip: 'Bu sayının altında yorumu olan restoranlar gizlenir' },
        { key: 'maxDistance', icon: MapPin, label: 'Max Mesafe', suffix: 'km', color: 'text-red-400', tooltip: 'Bu mesafeden uzak restoranlar gizlenir' },
    ] as const).filter((filter) => has(filter.key));

    const cardToggles = ([
        { key: 'showOnlyPromotions', label: 'Kampanya', tooltip: 'Sadece kampanyalı restoranları göster', isHider: false },
        { key: 'hideSponsored', label: 'Sponsor', tooltip: 'Sponsorlu restoranları gizle', isHider: true },
    ] as const).filter((chip) => has(chip.key));

    const sectionToggles = ([
        { key: 'hideCampaignCarousel', label: 'Karusel', tooltip: 'Üst kampanya karuselini gizle' },
        { key: 'hideMudavimSection', label: 'Müdavim', tooltip: 'GetirYemek Müdavim bölümünü gizle' },
        { key: 'hideAciktiysanSection', label: 'Açıktıysan', tooltip: 'ACIKTIYSAN bölümünü gizle' },
    ] as const).filter((chip) => has(chip.key));

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
            <div className={isTabMode ? "min-h-screen bg-gf-dark-950 text-white" : "w-full min-h-[400px] bg-gf-dark-900 text-white flex flex-col"}>
                <SettingsPage
                    settings={settings}
                    onBack={() => setCurrentPage('main')}
                    unblockRestaurant={unblockRestaurant}
                    clearBlocklist={clearBlocklist}
                    blockKeyword={blockKeyword}
                    unblockKeyword={unblockKeyword}
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
                    <button onClick={toggleEnabled} className="flex items-center gap-2 group" title={isOnSite ? `${platform.site} için filtreler` : (settings.isEnabled ? 'Filtreleri kapat' : 'Filtreleri aç')}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${settings.isEnabled ? 'bg-gradient-to-br from-gf-accent-purple to-gf-accent-purple-dark shadow-lg shadow-gf-accent-purple/30' : 'bg-gf-dark-600'}`}>
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-bold text-sm ${settings.isEnabled ? 'text-white' : 'text-gray-500'}`}>{platform.brand}</span>
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
                            className={`relative w-10 h-5 rounded-full transition-all ${settings.isEnabled ? 'bg-gf-accent-purple shadow-[0_0_8px_rgb(var(--gf-brand)/0.4)]' : 'bg-gf-dark-600'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="p-3 space-y-3">
                {/* Filter Grid - only the filters this site supports */}
                {numericFilters.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {numericFilters.map((filter) => (
                            <CompactInput
                                key={filter.key}
                                icon={filter.icon}
                                value={settings[filter.key] as number | null}
                                onChange={(v) => updateSetting(filter.key, v)}
                                label={filter.label}
                                suffix={filter.suffix}
                                color={filter.color}
                                disabled={!settings.isEnabled}
                                tooltip={filter.tooltip}
                            />
                        ))}
                    </div>
                )}

                {/* Delivery Time - Full Width */}
                {has('maxDeliveryTime') && (
                <div className="bg-gf-dark-800 rounded-lg p-2.5" title="Bu süreden uzun teslimat süreleri olan restoranlar gizlenir">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-xs text-gray-400">Max Teslimat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                value={localMaxDeliveryTime}
                                onChange={(e) => setLocalMaxDeliveryTime(e.target.value)}
                                onBlur={handleCommitMaxDeliveryTime}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCommitMaxDeliveryTime();
                                    }
                                }}
                                className="w-16 bg-gf-dark-700 border border-gf-dark-600 rounded px-2 py-1 text-sm font-mono text-white text-right
                                    focus:outline-none focus:border-gf-accent-purple transition-all disabled:opacity-50"
                                disabled={!settings.isEnabled}
                            />
                            <span className="text-xs text-gray-500">dk</span>
                        </div>
                    </div>
                </div>
                )}

                {/* Toggle Chips Row - Feature toggles */}
                {cardToggles.length > 0 && (
                    <div className="flex gap-1.5">
                        {cardToggles.map((chip) => (
                            <ChipToggle
                                key={chip.key}
                                label={chip.label}
                                active={settings[chip.key] as boolean}
                                onClick={() => updateSetting(chip.key, !settings[chip.key])}
                                disabled={!settings.isEnabled}
                                tooltip={chip.tooltip}
                                isHider={chip.isHider}
                            />
                        ))}
                    </div>
                )}

                {/* Section Visibility Chips - These hide sections */}
                {sectionToggles.length > 0 && (
                    <div className="flex gap-1.5">
                        {sectionToggles.map((chip) => (
                            <ChipToggle
                                key={chip.key}
                                label={chip.label}
                                active={settings[chip.key] as boolean}
                                onClick={() => updateSetting(chip.key, !settings[chip.key])}
                                disabled={!settings.isEnabled}
                                tooltip={chip.tooltip}
                                isHider={true}
                            />
                        ))}
                    </div>
                )}

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
                                        {settings.blockedRestaurants.map((key) => (
                                            <div key={key} className="flex items-center justify-between px-3 py-1.5 hover:bg-gf-dark-700">
                                                <span className="text-xs text-gray-300 truncate flex-1 mr-2">{settings.blockedNames?.[key] || formatSlug(key)}</span>
                                                <button onClick={() => unblockRestaurant(key)} className="text-gray-500 hover:text-gf-accent-red p-0.5" title="Engeli kaldır">
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

                {/* Blocked Keywords - Collapsible */}
                <div className="bg-gf-dark-800 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowKeywords(!showKeywords)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gf-dark-700 transition-colors"
                        title="Engellediğiniz kelimelerin listesi"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-gf-accent-purple" />
                            <span className="text-xs font-medium">Engellenen Kelimeler</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="bg-gf-dark-600 px-1.5 py-0.5 rounded text-xs font-mono">
                                {(settings.blockedKeywords || []).length}
                            </span>
                            {showKeywords ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                    </button>
                    {showKeywords && (
                        <div className="border-t border-gf-dark-600 p-3">
                            <BlockedKeywordsCard
                                settings={settings}
                                blockKeyword={blockKeyword}
                                unblockKeyword={unblockKeyword}
                                variant="compact"
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gf-dark-600 px-3 py-2 text-center mt-auto">
                {isOnSite && (
                    <p className="text-[10px] text-gray-400 mb-0.5">
                        <span className="text-gf-accent-purple">●</span> {platform.site} filtreleri
                    </p>
                )}
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
        <div className="w-full bg-gf-dark-900 text-white flex flex-col mx-auto">
            {content}
        </div>
    );
}

function formatSlug(key: string): string {
    // Fallback for entries saved before names were stored
    return key.replace(/^[a-z]+:/, '').split('-').slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
