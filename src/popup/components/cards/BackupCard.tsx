import { useRef, ChangeEvent } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { UserSettings } from '../../../shared/types';

interface CardProps {
    onExport: () => void;
    onImport: (settings: UserSettings) => Promise<void>;
    onReset: () => void;
    className?: string;
}

export default function BackupCard({ onExport, onImport, onReset, className }: CardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.version || !data.settings) throw new Error('Geçersiz dosya');
            await onImport(data.settings);
        } catch (err) {
            console.error('Import failed', err);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`grid grid-cols-2 gap-3 h-full ${className || ''}`}>
            <button
                onClick={onExport}
                className="flex flex-col items-center justify-center p-3 gap-2 bg-gf-dark-700/50 hover:bg-gf-dark-700 rounded-xl border border-gf-dark-700 transition-all group"
            >
                <Download className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                <span className="text-xs font-medium text-gray-300">Yedekle</span>
            </button>

            <label className="cursor-pointer">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                />
                <div className="flex flex-col items-center justify-center p-3 gap-2 bg-gf-dark-700/50 hover:bg-gf-dark-700 rounded-xl border border-gf-dark-700 h-full transition-all group">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs font-medium text-gray-300">Geri Yükle</span>
                </div>
            </label>

            <button
                onClick={() => {
                    if (confirm('Tüm ayarlar sıfırlanacak. Emin misiniz?')) {
                        onReset();
                    }
                }}
                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all group mt-auto"
            >
                <RotateCcw className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                <span className="text-xs font-medium text-red-400 group-hover:text-red-300">Varsayılana Sıfırla</span>
            </button>
        </div>
    );
}

