import { useState, useMemo, useRef, ChangeEvent } from 'react';
import {
    ArrowLeft, Search, Trash2, X, Download, Upload,
    RotateCcw, ArrowUpDown, Filter, LayoutGrid, Shield, Save
} from 'lucide-react';
import { UserSettings, DEFAULT_SETTINGS } from '../../shared/types';
import FilterSettings from './FilterSettings';

interface SettingsPageProps {
    settings: UserSettings;
    onBack?: () => void;
    unblockRestaurant: (slug: string) => void;
    clearBlocklist: () => void;
    onImport: (settings: UserSettings) => Promise<void>;
    onExport: () => void;
    onReset: () => void;
    updateSetting: (key: keyof UserSettings, value: any) => Promise<void>;
    isTabMode?: boolean;
}

type SortOrder = 'az' | 'za' | 'recent';
type SettingsTab = 'general' | 'filters' | 'blocked' | 'backup';

export default function SettingsPage({
    settings,
    onBack,
    unblockRestaurant,
    clearBlocklist,
    onImport,
    onExport,
    onReset,
    updateSetting,
    isTabMode = false,
}: SettingsPageProps) {
    // State
    const [activeTab, setActiveTab] = useState<SettingsTab>('filters');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter logic for blocked restaurants
    const filteredRestaurants = useMemo(() => {
        let results = settings.blockedRestaurants.filter((slug) =>
            formatSlug(slug).toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortOrder === 'az') {
            results = [...results].sort((a, b) =>
                formatSlug(a).localeCompare(formatSlug(b), 'tr')
            );
        } else if (sortOrder === 'za') {
            results = [...results].sort((a, b) =>
                formatSlug(b).localeCompare(formatSlug(a), 'tr')
            );
        }
        return results;
    }, [settings.blockedRestaurants, searchQuery, sortOrder]);

    // Helpers
    const handleFileImport = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError(null);

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.version || !data.settings) throw new Error('Geçersiz dosya formatı');

            const importedSettings = data.settings as Partial<UserSettings>;
            if (typeof importedSettings.isEnabled !== 'boolean') throw new Error('Ayarlar eksik veya hatalı');

            const mergedSettings: UserSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
            await onImport(mergedSettings);
        } catch (err) {
            setImportError(err instanceof Error ? err.message : 'İçe aktarma başarısız');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleReset = () => {
        onReset();
        setShowResetConfirm(false);
    };

    const cycleSortOrder = () => {
        setSortOrder((prev) => {
            if (prev === 'recent') return 'az';
            if (prev === 'az') return 'za';
            return 'recent';
        });
    };

    const getSortLabel = () => {
        if (sortOrder === 'az') return 'A-Z';
        if (sortOrder === 'za') return 'Z-A';
        return 'Son Eklenen';
    };

    // --- Sub-Components ---

    const Sidebar = () => (
        <aside className="w-64 bg-gf-dark-900 border-r border-gf-dark-700 flex flex-col h-full">
            <div className="p-6 border-b border-gf-dark-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gf-accent-purple to-violet-700 flex items-center justify-center shadow-lg shadow-gf-accent-purple/20">
                    <Filter className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">GetirFiltre</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <button
                    onClick={() => setActiveTab('filters')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${activeTab === 'filters'
                            ? 'bg-gf-accent-purple text-white shadow-lg shadow-gf-accent-purple/20'
                            : 'text-gray-400 hover:bg-gf-dark-800 hover:text-gray-200'}`}
                >
                    <LayoutGrid className="w-5 h-5" />
                    Filtre Ayarları
                </button>

                <button
                    onClick={() => setActiveTab('blocked')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${activeTab === 'blocked'
                            ? 'bg-gf-accent-purple text-white shadow-lg shadow-gf-accent-purple/20'
                            : 'text-gray-400 hover:bg-gf-dark-800 hover:text-gray-200'}`}
                >
                    <Shield className="w-5 h-5" />
                    Engellenenler
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-mono
                        ${activeTab === 'blocked' ? 'bg-white/20 text-white' : 'bg-gf-dark-700 text-gray-500'}`}>
                        {settings.blockedRestaurants.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('backup')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${activeTab === 'backup'
                            ? 'bg-gf-accent-purple text-white shadow-lg shadow-gf-accent-purple/20'
                            : 'text-gray-400 hover:bg-gf-dark-800 hover:text-gray-200'}`}
                >
                    <Save className="w-5 h-5" />
                    Yedekleme & Sıfırlama
                </button>
            </nav>

            <div className="p-4 border-t border-gf-dark-700 text-center">
                <p className="text-xs text-gray-600 font-mono">v1.0.0</p>
            </div>
        </aside>
    );

    // --- Tab Contents ---

    const renderFiltersTab = () => (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Filtre Ayarları</h2>
                <p className="text-gray-400 text-sm">Restoranları gizlemek için kriterleri belirleyin.</p>
            </div>

            <FilterSettings
                settings={settings}
                updateSetting={updateSetting}
                disabled={!settings.isEnabled}
            />
        </div>
    );

    const renderBlockedTab = () => (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Engellenen Restoranlar</h2>
                    <p className="text-gray-400 text-sm">Gizlediğiniz restoranları yönetin.</p>
                </div>
                {settings.blockedRestaurants.length > 0 && (
                    <button
                        onClick={clearBlocklist}
                        className="flex items-center gap-2 px-4 py-2 bg-gf-accent-red/10 text-gf-accent-red rounded-lg hover:bg-gf-accent-red/20 transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Listeyi Temizle
                    </button>
                )}
            </div>

            <div className="bg-gf-dark-800 rounded-xl p-4 flex gap-3 sticky top-0 z-10">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gf-accent-purple transition-colors" />
                    <input
                        type="text"
                        placeholder="Restoran ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gf-dark-700 border border-gf-dark-600 rounded-lg pl-10 pr-4 py-2.5
                            text-sm placeholder-gray-500 text-gray-200
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple transition-all"
                    />
                </div>
                <button
                    onClick={cycleSortOrder}
                    className="flex items-center gap-2 px-4 py-2 bg-gf-dark-700 border border-gf-dark-600 
                        rounded-lg text-sm text-gray-300 hover:bg-gf-dark-600 transition-all font-medium whitespace-nowrap"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>{getSortLabel()}</span>
                </button>
            </div>

            <div className="flex-1 bg-gf-dark-800 rounded-2xl border border-gf-dark-700 overflow-hidden flex flex-col min-h-[400px]">
                {filteredRestaurants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-3 p-8">
                        <Search className="w-12 h-12 opacity-20" />
                        <p className="text-sm">
                            {searchQuery ? 'Sonuç bulunamadı' : 'Listeniz tertemiz!'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <div className="divide-y divide-gf-dark-700">
                            {filteredRestaurants.map((slug) => (
                                <div
                                    key={slug}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gf-dark-700/50 transition-colors group"
                                >
                                    <span className="text-gray-300 font-medium truncate flex-1 mr-4">
                                        {formatSlug(slug)}
                                    </span>
                                    <button
                                        onClick={() => unblockRestaurant(slug)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gf-accent-red hover:bg-gf-accent-red/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Engeli kaldır"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderBackupTab = () => (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Yedekleme ve Sıfırlama</h2>
                <p className="text-gray-400 text-sm">Ayarlarınızı kaydedin veya varsayılana döndürün.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={onExport}
                    className="flex flex-col items-center justify-center gap-4 p-8
                        bg-gf-dark-800 border-2 border-gf-dark-700 rounded-2xl
                        hover:borer-gf-accent-purple/50 hover:bg-gf-dark-750 transition-all group text-left items-start"
                >
                    <div className="w-12 h-12 rounded-full bg-gf-dark-700 flex items-center justify-center group-hover:bg-gf-accent-purple/20 group-hover:text-gf-accent-purple transition-all">
                        <Download className="w-6 h-6 text-gray-400 group-hover:text-gf-accent-purple" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-200 mb-1">Dışa Aktar</h3>
                        <p className="text-xs text-gray-500">Ayarları JSON dosyası olarak indir</p>
                    </div>
                </button>

                <label className="cursor-pointer">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-4 p-8
                        bg-gf-dark-800 border-2 border-gf-dark-700 rounded-2xl h-full
                        hover:border-gf-accent-purple/50 hover:bg-gf-dark-750 transition-all group text-left items-start"
                    >
                        <div className="w-12 h-12 rounded-full bg-gf-dark-700 flex items-center justify-center group-hover:bg-gf-accent-purple/20 group-hover:text-gf-accent-purple transition-all">
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-gf-accent-purple" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-200 mb-1">İçe Aktar</h3>
                            <p className="text-xs text-gray-500">JSON dosyasından geri yükle</p>
                        </div>
                    </div>
                </label>
            </div>

            {importError && (
                <div className="p-4 bg-gf-accent-red/10 border border-gf-accent-red/20 rounded-xl flex items-center gap-3 text-gf-accent-red">
                    <X className="w-5 h-5" />
                    <p className="text-sm font-medium">{importError}</p>
                </div>
            )}

            <div className="pt-8 border-t border-gf-dark-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                    Tehlikeli Bölge
                </h3>

                {showResetConfirm ? (
                    <div className="p-6 bg-gf-accent-red/5 border border-gf-accent-red/20 rounded-2xl space-y-4">
                        <p className="text-gray-300 font-medium text-center">
                            Tüm ayarlarınız ve engellenen restoran listeniz silinecek. Emin misiniz?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="px-6 py-2 bg-gf-dark-700 rounded-lg text-sm text-gray-300 hover:bg-gf-dark-600 transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-gf-accent-red text-white rounded-lg text-sm hover:bg-gf-accent-red/90 transition-colors shadow-lg shadow-gf-accent-red/20"
                            >
                                Evet, Sıfırla
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full flex items-center justify-between px-6 py-4
                            bg-gf-dark-800 border border-gf-dark-700 rounded-2xl
                            hover:bg-gf-accent-red/5 hover:border-gf-accent-red/30 hover:text-gf-accent-red transition-all group"
                    >
                        <div className="text-left">
                            <span className="block font-medium text-gray-300 group-hover:text-gf-accent-red transition-colors">Varsayılana Sıfırla</span>
                            <span className="text-xs text-gray-500">Tüm verileri siler ve başlangıç ayarlarına döner</span>
                        </div>
                        <RotateCcw className="w-5 h-5 text-gray-500 group-hover:text-gf-accent-red transition-colors" />
                    </button>
                )}
            </div>
        </div>
    );


    // --- Render ---

    if (isTabMode) {
        return (
            <div className="flex min-h-screen bg-gf-dark-950 text-white font-sans">
                <Sidebar />
                <main className="flex-1 h-screen overflow-y-auto bg-gf-dark-950">
                    <div className="p-8 pb-20 min-h-full">
                        {activeTab === 'filters' && renderFiltersTab()}
                        {activeTab === 'blocked' && renderBlockedTab()}
                        {activeTab === 'backup' && renderBackupTab()}
                    </div>
                </main>
            </div>
        );
    }

    // Legacy Popup Mode (Simplified)
    return (
        <div className="w-full h-full flex flex-col bg-gf-dark-900 text-white">
            <header className="p-4 border-b border-gf-dark-600 flex items-center gap-3 bg-gf-dark-900 sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-lg hover:bg-gf-dark-700 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold">Ayarlar</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Compact Filters */}
                <FilterSettings
                    settings={settings}
                    updateSetting={updateSetting}
                    disabled={!settings.isEnabled}
                />

                {/* Link to full settings */}
                <div className="p-4 bg-gf-dark-800 rounded-xl border border-gf-dark-700 text-center space-y-3">
                    <Shield className="w-8 h-8 text-gf-accent-purple mx-auto opacity-50" />
                    <p className="text-sm text-gray-400">
                        Engellenenler ve gelişmiş ayarlar için tam ekran moduna geçin.
                    </p>
                    <button
                        onClick={() => {
                            if (chrome.tabs) {
                                chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
                            } else {
                                window.open('index.html?page=settings', '_blank');
                            }
                        }}
                        className="text-gf-accent-purple text-sm font-medium hover:underline"
                    >
                        Ayarları Yeni Sekmede Aç
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Format slug for display
 */
function formatSlug(slug: string): string {
    return slug
        .split('-')
        .slice(0, 3)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
