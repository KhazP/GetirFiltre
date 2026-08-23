import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { isTelemetryEnabled, setTelemetryEnabled } from '../../../shared/telemetry';

/**
 * Opt-out switch for the anonymous usage counts.
 *
 * Deliberately not part of `UserSettings`: those go through chrome.storage.sync,
 * and the telemetry install ID must stay on this device only. This card talks to
 * the telemetry module directly and saves immediately.
 */
export default function PrivacyCard() {
    const [enabled, setEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        isTelemetryEnabled()
            .then((value) => setEnabled(value))
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const toggle = async () => {
        const next = !enabled;
        setEnabled(next);
        await setTelemetryEnabled(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                        <BarChart3 className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                        <span className="text-sm text-gray-300 block">Anonim Kullanım İstatistikleri</span>
                        <p className="text-xs text-gray-500">
                            Sadece beş olayın sayısı gönderilir: kuruldu, güncellendi, oturum başladı,
                            filtre uygulandı, restoran engellendi.
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggle}
                    disabled={isLoading}
                    aria-label="Anonim kullanım istatistikleri"
                    className={`
                        relative w-11 h-6 shrink-0 rounded-full transition-colors
                        ${enabled ? 'bg-gf-accent-purple' : 'bg-gf-dark-600'}
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <span className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                        ${enabled ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
                Restoran adları, engellenen kelimeler, filtre değerleri, adresler ve gezdiğiniz
                sayfalar <span className="text-gray-400">asla</span> gönderilmez. Kapattığınızda
                rastgele kurulum kimliği ve bekleyen tüm sayaçlar silinir.
            </p>
        </div>
    );
}
