import { UserSettings } from '../../../shared/types';

interface CardProps {
    settings: UserSettings;
    updateSetting: (key: keyof UserSettings, value: any) => Promise<void>;
    disabled?: boolean;
    variant?: 'default' | 'compact';
}

export default function SectionVisibilityCard({ settings, updateSetting, disabled, variant = 'default' }: CardProps) {
    const items = [
        {
            key: 'hideCampaignCarousel',
            label: 'Kampanya Gizle',
            desc: 'Üst kampanya karuselini gizle (Getir + Trendyol Go)'
        },
        {
            key: 'hideMudavimSection',
            label: 'Müdavim Gizle',
            desc: 'GetirYemek Müdavim bölümünü gizle (sadece Getir)'
        },
        {
            key: 'hideAciktiysanSection',
            label: 'ACIKTIYSAN Gizle',
            desc: 'ACIKTIYSAN bölümünü gizle (sadece Getir)'
        }
    ];

    const content = (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-gray-300">{item.label}</span>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <button
                        onClick={() => updateSetting(item.key as keyof UserSettings, !settings[item.key as keyof UserSettings])}
                        disabled={disabled}
                        className={`
                            relative w-11 h-6 rounded-full transition-colors
                            ${settings[item.key as keyof UserSettings] ? 'bg-gf-accent-purple' : 'bg-gf-dark-600'}
                             ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <span className={`
                            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                            ${settings[item.key as keyof UserSettings] ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                    </button>
                </div>
            ))}
        </div>
    );

    if (variant === 'compact') {
        return (
            <div className="bg-gf-dark-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Sayfa Bölümleri</h3>
                {content}
            </div>
        );
    }

    return content;
}

