import { useState, useMemo } from 'react';
import { Shield, Search, ArrowUpDown, Trash2, X } from 'lucide-react';
import { UserSettings } from '../../../shared/types';

interface CardProps {
    settings: UserSettings;
    unblockRestaurant: (slug: string) => void;
    clearBlocklist: () => void;
    className?: string;
}

export default function BlockedRestaurantsCard({ settings, unblockRestaurant, clearBlocklist, className }: CardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'az' | 'za'>('recent');

    // Define formatSlug BEFORE useMemo uses it (arrow functions are not hoisted)
    const formatSlug = (slug: string) => {
        return slug
            .split('-')
            .slice(0, 3)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const filteredRestaurants = useMemo(() => {
        let results = settings.blockedRestaurants.filter((slug) =>
            formatSlug(slug).toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortOrder === 'az') {
            results = [...results].sort((a, b) => formatSlug(a).localeCompare(formatSlug(b), 'tr'));
        } else if (sortOrder === 'za') {
            results = [...results].sort((a, b) => formatSlug(b).localeCompare(formatSlug(a), 'tr'));
        }
        return results;
    }, [settings.blockedRestaurants, searchQuery, sortOrder]);

    return (
        <div className={`flex flex-col h-full gap-4 ${className || ''}`}>
            {/* Controls */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gf-accent-purple transition-colors" />
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gf-dark-700 border border-gf-dark-600 rounded-lg pl-9 pr-3 py-2
                            text-sm placeholder-gray-500 text-gray-200
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple transition-all"
                    />
                </div>
                <button
                    onClick={() => setSortOrder(prev => prev === 'recent' ? 'az' : prev === 'az' ? 'za' : 'recent')}
                    className="px-3 py-2 bg-gf-dark-700 border border-gf-dark-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Sıralama"
                >
                    <ArrowUpDown className="w-4 h-4" />
                </button>
                {settings.blockedRestaurants.length > 0 && (
                    <button
                        onClick={clearBlocklist}
                        className="px-3 py-2 bg-gf-accent-red/10 border border-gf-accent-red/20 rounded-lg text-gf-accent-red hover:bg-gf-accent-red/20 transition-colors"
                        title="Tümünü Temizle"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 bg-gf-dark-700/50 rounded-xl border border-gf-dark-700 overflow-hidden relative min-h-[200px]">
                {filteredRestaurants.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                        <Shield className="w-8 h-8 opacity-20" />
                        <p className="text-xs">{searchQuery ? 'Sonuç yok' : 'Liste boş'}</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {filteredRestaurants.map((slug) => (
                            <div
                                key={slug}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gf-dark-700/80 group transition-colors"
                            >
                                <span className="text-sm text-gray-300 truncate flex-1 mr-2 font-medium">
                                    {formatSlug(slug)}
                                </span>
                                <button
                                    onClick={() => unblockRestaurant(slug)}
                                    className="text-gray-500 hover:text-gf-accent-red p-1 rounded-md hover:bg-gf-accent-red/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
