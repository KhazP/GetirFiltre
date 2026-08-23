import { useState, useMemo } from 'react';
import { Tag, Search, ArrowUpDown, X, Plus } from 'lucide-react';
import { UserSettings } from '../../../shared/types';

interface CardProps {
    settings: UserSettings;
    blockKeyword: (keyword: string) => void;
    unblockKeyword: (keyword: string) => void;
    clearBlocklist?: () => void;
    className?: string;
    variant?: 'default' | 'compact';
}

export default function BlockedKeywordsCard({
    settings,
    blockKeyword,
    unblockKeyword,
    className,
    variant = 'default'
}: CardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [newKeyword, setNewKeyword] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'az' | 'za'>('recent');

    const handleAddKeyword = () => {
        const trimmed = newKeyword.trim().toLowerCase();
        if (trimmed) {
            blockKeyword(trimmed);
            setNewKeyword('');
        }
    };

    const filteredKeywords = useMemo(() => {
        let results = (settings.blockedKeywords || []).filter((keyword) =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortOrder === 'az') {
            results = [...results].sort((a, b) => a.localeCompare(b, 'tr'));
        } else if (sortOrder === 'za') {
            results = [...results].sort((a, b) => b.localeCompare(a, 'tr'));
        }
        return results;
    }, [settings.blockedKeywords, searchQuery, sortOrder]);

    const content = (
        <div className="flex flex-col h-full gap-4">
            {/* Input to add new keyword */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Engellenecek kelime (örn: döner)..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleAddKeyword();
                        }
                    }}
                    className="flex-1 bg-gf-dark-700 border border-gf-dark-600 rounded-lg px-3 py-2
                        text-sm placeholder-gray-500 text-gray-200
                        focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple transition-all"
                />
                <button
                    onClick={handleAddKeyword}
                    className="p-2.5 bg-gf-accent-purple hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    title="Ekle"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gf-accent-purple transition-colors" />
                    <input
                        type="text"
                        placeholder="Kelimelerde ara..."
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
            </div>

            {/* List */}
            <div className="flex-1 bg-gf-dark-700/50 rounded-xl border border-gf-dark-700 overflow-hidden relative min-h-[160px]">
                {filteredKeywords.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                        <Tag className="w-8 h-8 opacity-20" />
                        <p className="text-xs">{searchQuery ? 'Sonuç yok' : 'Liste boş'}</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {filteredKeywords.map((keyword) => (
                            <div
                                key={keyword}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gf-dark-700/80 group transition-colors"
                            >
                                <span className="text-sm text-gray-300 truncate flex-1 mr-2 font-medium">
                                    {keyword}
                                </span>
                                <button
                                    onClick={() => unblockKeyword(keyword)}
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

    if (variant === 'compact') {
        return (
            <div className={`flex flex-col gap-2 ${className || ''}`}>
                {/* Input to add new keyword */}
                <div className="flex gap-1.5">
                    <input
                        type="text"
                        placeholder="Kelime ekle (örn: burger)..."
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddKeyword();
                            }
                        }}
                        className="flex-1 bg-gf-dark-700 border border-gf-dark-600 rounded px-2 py-1 text-xs text-white placeholder-gray-500
                            focus:outline-none focus:border-gf-accent-purple focus:ring-1 focus:ring-gf-accent-purple transition-all"
                    />
                    <button
                        onClick={handleAddKeyword}
                        className="p-1.5 bg-gf-accent-purple hover:bg-violet-750 text-white rounded text-xs transition-colors flex items-center justify-center"
                        title="Ekle"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Tag Cloud of keywords */}
                <div className="bg-gf-dark-700/30 rounded-lg p-2 border border-gf-dark-700/50 min-h-[48px] max-h-[120px] overflow-y-auto custom-scrollbar">
                    {(!settings.blockedKeywords || settings.blockedKeywords.length === 0) ? (
                        <div className="flex items-center justify-center h-8 text-gray-500 text-[11px] gap-1">
                            <Tag className="w-3 h-3 opacity-30" />
                            <span>Engellenen kelime yok</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {settings.blockedKeywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="inline-flex items-center gap-1 bg-gf-dark-600 text-gray-300 text-[11px] px-2 py-0.5 rounded border border-gf-dark-500"
                                >
                                    <span className="truncate max-w-[80px]" title={keyword}>{keyword}</span>
                                    <button
                                        onClick={() => unblockKeyword(keyword)}
                                        className="text-gray-500 hover:text-gf-accent-red p-0.5 rounded transition-all"
                                        title="Kaldır"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full gap-4 ${className || ''}`}>
            {content}
        </div>
    );
}
