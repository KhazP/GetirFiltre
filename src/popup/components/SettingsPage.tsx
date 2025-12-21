import { useState, useMemo, useRef, ChangeEvent } from 'react';
import { ArrowLeft, Search, Trash2, X, Download, Upload, RotateCcw, ArrowUpDown } from 'lucide-react';
import { UserSettings, DEFAULT_SETTINGS } from '../../shared/types';

interface SettingsPageProps {
    settings: UserSettings;
    onBack: () => void;
    unblockRestaurant: (slug: string) => void;
    clearBlocklist: () => void;
    onImport: (settings: UserSettings) => Promise<void>;
    onExport: () => void;
    onReset: () => void;
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

            // Validate structure
            if (!data.version || !data.settings) {
                throw new Error('Geçersiz dosya formatı');
            }

            // Validate settings structure
            const importedSettings = data.settings as Partial<UserSettings>;
            if (typeof importedSettings.isEnabled !== 'boolean') {
                throw new Error('Ayarlar eksik veya hatalı');
            }

            // Merge with defaults to ensure all fields exist
            const mergedSettings: UserSettings = {
                ...DEFAULT_SETTINGS,
                ...importedSettings,
            };

            await onImport(mergedSettings);
        } catch (err) {
            setImportError(err instanceof Error ? err.message : 'İçe aktarma başarısız');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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

    return (
        <div className="w-[320px] min-h-[400px] max-h-[600px] bg-gf-dark-900 text-white flex flex-col">
            {/* Header */}
            <header className="bg-gf-dark-800 p-4 border-b border-gf-dark-600 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-gf-dark-700 transition-colors"
                    title="Geri"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <h1 className="font-bold text-lg">Ayarlar</h1>
            </header>

            {/* Content - Scrollable */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Blocked Restaurants Section */}
                <section className="bg-gf-dark-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gf-dark-600">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-medium flex items-center gap-2">
                                <X className="w-4 h-4 text-gf-accent-red" />
                                Engellenen Restoranlar
                                <span className="bg-gf-dark-600 px-2 py-0.5 rounded-full text-xs font-mono">
                                    {settings.blockedRestaurants.length}
                                </span>
                            </h2>
                        </div>

                        {/* Search and Sort */}
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Restoran ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gf-dark-700 border border-gf-dark-500 rounded-lg pl-9 pr-3 py-2
                                        text-sm placeholder-gray-500
                                        focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple"
                                />
                            </div>
                            <button
                                onClick={cycleSortOrder}
                                className="flex items-center gap-1 px-3 py-2 bg-gf-dark-700 border border-gf-dark-500 
                                    rounded-lg text-sm text-gray-300 hover:bg-gf-dark-600 transition-colors"
                                title="Sıralama"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="text-xs font-mono">{getSortLabel()}</span>
                            </button>
                        </div>
                    </div>

                    {/* Restaurant List */}
                    <div className="max-h-[200px] overflow-y-auto">
                        {filteredRestaurants.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 text-center">
                                {searchQuery ? 'Sonuç bulunamadı' : 'Henüz engellenmiş restoran yok'}
                            </p>
                        ) : (
                            filteredRestaurants.map((slug) => (
                                <div
                                    key={slug}
                                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gf-dark-700 
                                        border-b border-gf-dark-700 last:border-b-0"
                                >
                                    <span className="text-sm text-gray-300 truncate flex-1 mr-2">
                                        {formatSlug(slug)}
                                    </span>
                                    <button
                                        onClick={() => unblockRestaurant(slug)}
                                        className="p-1 text-gray-500 hover:text-gf-accent-purple transition-colors"
                                        title="Engeli kaldır"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Clear All */}
                    {settings.blockedRestaurants.length > 0 && (
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
                    )}
                </section>

                {/* Import/Export Section */}
                <section className="bg-gf-dark-800 rounded-lg p-4 space-y-3">
                    <h2 className="font-medium text-sm text-gray-300 mb-3">
                        Ayarları Yedekle
                    </h2>

                    <div className="flex gap-2">
                        <button
                            onClick={onExport}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5
                                bg-gf-dark-700 border border-gf-dark-500 rounded-lg
                                hover:bg-gf-dark-600 hover:border-gf-accent-purple/50 transition-colors text-sm"
                        >
                            <Download className="w-4 h-4 text-gf-accent-purple" />
                            Dışa Aktar
                        </button>

                        <label className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileImport}
                                className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2 px-3 py-2.5
                                bg-gf-dark-700 border border-gf-dark-500 rounded-lg cursor-pointer
                                hover:bg-gf-dark-600 hover:border-gf-accent-purple/50 transition-colors text-sm"
                            >
                                <Upload className="w-4 h-4 text-gf-accent-purple" />
                                İçe Aktar
                            </div>
                        </label>
                    </div>

                    {importError && (
                        <p className="text-xs text-gf-accent-red text-center">
                            {importError}
                        </p>
                    )}

                    <p className="text-xs text-gray-500">
                        Ayarlarınızı JSON dosyası olarak yedekleyin veya geri yükleyin
                    </p>
                </section>

                {/* Reset Section */}
                <section className="bg-gf-dark-800 rounded-lg p-4">
                    {showResetConfirm ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-300 text-center">
                                Tüm ayarlar sıfırlanacak. Emin misiniz?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 px-3 py-2 bg-gf-dark-700 rounded-lg text-sm
                                        hover:bg-gf-dark-600 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                                        bg-gf-accent-red/20 text-gf-accent-red rounded-lg
                                        hover:bg-gf-accent-red/30 transition-colors text-sm"
                                >
                                    Sıfırla
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2
                                bg-gf-dark-700 border border-gf-dark-500 rounded-lg
                                hover:bg-gf-dark-600 transition-colors text-sm text-gray-300"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Varsayılana Sıfırla
                        </button>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gf-dark-600 p-3 text-center">
                <p className="text-xs text-gray-500">
                    GetirFiltre v1.0.0
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
