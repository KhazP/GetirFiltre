import { useState, useMemo, useRef, ChangeEvent } from 'react';
import { ArrowLeft, Search, Trash2, X, Download, Upload, RotateCcw, ArrowUpDown, Filter } from 'lucide-react';
import { UserSettings, DEFAULT_SETTINGS } from '../../shared/types';

interface SettingsPageProps {
    settings: UserSettings;
    onBack: () => void;
    unblockRestaurant: (slug: string) => void;
    clearBlocklist: () => void;
    onImport: (settings: UserSettings) => Promise<void>;
    onExport: () => void;
    onReset: () => void;
    isTabMode?: boolean;
}

type SortOrder = 'az' | 'za' | 'recent';

export default function SettingsPage({
    settings,
    onBack,
    unblockRestaurant,
    clearBlocklist,
    onImport,
    onExport,
    onReset,
    isTabMode = false,
}: SettingsPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter and sort restaurants
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
        // 'recent' keeps original order (most recently added last)

        return results;
    }, [settings.blockedRestaurants, searchQuery, sortOrder]);

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
        return 'Son';
    };

    // --- Render Components ---

    const Header = () => (
        <header className={`${isTabMode ? 'px-8 py-6' : 'p-4 border-b border-gf-dark-600'} flex items-center gap-3 bg-gf-dark-900/50 backdrop-blur-sm sticky top-0 z-10`}>
            {isTabMode && (
                <div className="flex items-center gap-2 mr-4 border-r border-gf-dark-600 pr-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gf-accent-purple to-violet-700 flex items-center justify-center shadow-lg shadow-gf-accent-purple/20">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">GetirFiltre</span>
                </div>
            )}

            <button
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-gf-dark-700 transition-colors group"
                title="Geri"
            >
                <ArrowLeft className={`w-5 h-5 ${isTabMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-400'}`} />
            </button>
            <h1 className={`${isTabMode ? 'text-2xl' : 'text-lg'} font-bold`}>Ayarlar</h1>
        </header>
    );

    const BlockedListPanel = () => (
        <section className={`bg-gf-dark-900 ${isTabMode ? 'rounded-2xl border border-gf-dark-700 shadow-xl h-full flex flex-col' : 'rounded-lg flex flex-col'}`}>
            <div className="p-4 border-b border-gf-dark-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2 text-lg">
                        <X className="w-5 h-5 text-gf-accent-red" />
                        Engellenen Restoranlar
                        <span className="bg-gf-dark-800 border border-gf-dark-600 text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-mono ml-2">
                            {settings.blockedRestaurants.length}
                        </span>
                    </h2>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gf-accent-purple transition-colors" />
                        <input
                            type="text"
                            placeholder="Restoran ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gf-dark-800 border border-gf-dark-600 rounded-xl pl-10 pr-4 py-2.5
                                text-sm placeholder-gray-500 text-gray-200
                                focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple transition-all"
                        />
                    </div>
                    <button
                        onClick={cycleSortOrder}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gf-dark-800 border border-gf-dark-600 
                            rounded-xl text-sm text-gray-300 hover:bg-gf-dark-700 hover:border-gray-500 transition-all font-medium"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        <span>{getSortLabel()}</span>
                    </button>
                </div>
            </div>

            <div className={`flex-1 ${isTabMode ? 'overflow-y-auto custom-scrollbar' : 'overflow-y-auto max-h-[200px]'}`}>
                {filteredRestaurants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500 gap-3">
                        <Search className="w-8 h-8 opacity-20" />
                        <p className="text-sm">
                            {searchQuery ? 'Sonuç bulunamadı' : 'Listeniz tertemiz!'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gf-dark-800">
                        {filteredRestaurants.map((slug) => (
                            <div
                                key={slug}
                                className="flex items-center justify-between px-5 py-3 hover:bg-gf-dark-800/50 transition-colors group"
                            >
                                <span className="text-sm text-gray-300 font-medium truncate flex-1 mr-4">
                                    {formatSlug(slug)}
                                </span>
                                <button
                                    onClick={() => unblockRestaurant(slug)}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gf-accent-red hover:bg-gf-accent-red/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Engeli kaldır"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {settings.blockedRestaurants.length > 0 && (
                <div className="p-4 border-t border-gf-dark-700 bg-gf-dark-900/50 rounded-b-2xl">
                    <button
                        onClick={clearBlocklist}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3
                            bg-gf-accent-red/10 border border-gf-accent-red/20 text-gf-accent-red rounded-xl
                            hover:bg-gf-accent-red/20 hover:border-gf-accent-red/30 transition-all text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Listeyi Temizle
                    </button>
                </div>
            )}
        </section>
    );

    const ActionsPanel = () => (
        <div className="space-y-6">
            <section className={`bg-gf-dark-900 ${isTabMode ? 'rounded-2xl border border-gf-dark-700 shadow-xl p-6' : 'rounded-lg p-4'}`}>
                <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-gf-accent-purple" />
                    Yedekleme
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onExport}
                        className="flex flex-col items-center justify-center gap-2 p-4
                            bg-gf-dark-800 border border-gf-dark-600 rounded-xl
                            hover:bg-gf-dark-700 hover:border-gf-accent-purple/50 transition-all group"
                    >
                        <Download className="w-6 h-6 text-gray-400 group-hover:text-gf-accent-purple transition-colors" />
                        <span className="text-sm font-medium text-gray-300">Dışa Aktar</span>
                    </button>

                    <label className="cursor-pointer">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 p-4
                            bg-gf-dark-800 border border-gf-dark-600 rounded-xl h-full
                            hover:bg-gf-dark-700 hover:border-gf-accent-purple/50 transition-all group"
                        >
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-gf-accent-purple transition-colors" />
                            <span className="text-sm font-medium text-gray-300">İçe Aktar</span>
                        </div>
                    </label>
                </div>

                {importError && (
                    <div className="mt-3 p-3 bg-gf-accent-red/10 border border-gf-accent-red/20 rounded-lg text-xs text-gf-accent-red text-center">
                        {importError}
                    </div>
                )}

                <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    Ayarlarınızı ve engellenen restoran listenizi JSON dosyası olarak bilgisayarınıza kaydedebilir veya geri yükleyebilirsiniz.
                </p>
            </section>

            <section className={`bg-gf-dark-900 ${isTabMode ? 'rounded-2xl border border-gf-dark-700 shadow-xl p-6' : 'rounded-lg p-4'}`}>
                <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                    Sıfırlama
                </h3>

                {showResetConfirm ? (
                    <div className="space-y-3 p-4 bg-gf-dark-800 rounded-xl border border-gf-dark-600">
                        <p className="text-sm text-gray-300 text-center font-medium">
                            Tüm ayarlar silinecek!
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 px-3 py-2 bg-gf-dark-700 rounded-lg text-sm hover:bg-gf-dark-600"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 px-3 py-2 bg-gf-accent-red text-white rounded-lg text-sm hover:bg-gf-accent-red/90"
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full flex items-center justify-between px-4 py-3
                            bg-gf-dark-800 border border-gf-dark-600 rounded-xl
                            hover:bg-gf-accent-red/10 hover:border-gf-accent-red/30 hover:text-gf-accent-red transition-all text-sm text-gray-400"
                    >
                        <span>Varsayılana Sıfırla</span>
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </section>
        </div>
    );

    // --- Main Layout ---

    if (isTabMode) {
        return (
            <div className="min-h-screen flex flex-col bg-gf-dark-950 text-white">
                <Header />
                <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
                        {/* Left Column: List (Flexible Height) */}
                        <div className="lg:col-span-8 h-full">
                            <BlockedListPanel />
                        </div>

                        {/* Right Column: Actions (Fixed Stack) */}
                        <div className="lg:col-span-4 h-full overflow-y-auto">
                            <ActionsPanel />
                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-600 font-mono">GetirFiltre v1.0.0</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Popup Layout (Legacy)
    return (
        <div className="w-full h-full flex flex-col bg-gf-dark-900 text-white">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <BlockedListPanel />
                <div className="grid gap-4">
                    <ActionsPanel />
                </div>
            </main>
            <footer className="border-t border-gf-dark-600 p-3 text-center flex-shrink-0">
                <p className="text-xs text-gray-500">GetirFiltre v1.0.0</p>
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
        .slice(0, 3)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
