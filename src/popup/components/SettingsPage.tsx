import { ArrowLeft, Shield, Star, ShoppingBag, MessageSquare, MapPin, Clock, Layout, Save } from 'lucide-react';
import { UserSettings } from '../../shared/types';
import FilterSettings from './FilterSettings';
import BentoGrid from './Bento/BentoGrid';
import BentoCard from './Bento/BentoCard';
import RatingFilterCard from './cards/RatingFilterCard';
import BasketFilterCard from './cards/BasketFilterCard';
import ReviewFilterCard from './cards/ReviewFilterCard';
import DistanceFilterCard from './cards/DistanceFilterCard';
import DeliveryFilterCard from './cards/DeliveryFilterCard';
import TogglesCard from './cards/TogglesCard';
import SectionVisibilityCard from './cards/SectionVisibilityCard';
import BlockedRestaurantsCard from './cards/BlockedRestaurantsCard';
import BackupCard from './cards/BackupCard';

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
    // --- Full Page Bento Layout ---
    if (isTabMode) {
        return (
            <div className="min-h-screen bg-gf-dark-950 text-white font-sans p-8 pb-20 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gf-accent-purple to-violet-700 flex items-center justify-center shadow-lg shadow-gf-accent-purple/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                GetirFiltre Ayarları
                            </h1>
                            <p className="text-gray-400">Tüm filtrelerinizi tek bir yerden yönetin.</p>
                        </div>
                    </header>

                    {/* Dashboard Grid */}
                    <BentoGrid>
                        {/* Row 1: Primary Numeric Filters */}
                        <BentoCard title="Minimum Puan" description="Bu puanın altındaki restoranlar gizlenir" icon={<Star className="w-5 h-5 text-yellow-500" />}>
                            <RatingFilterCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                        </BentoCard>
                        <BentoCard title="Maksimum Sepet Limiti" description="Bu limiti aşan minimum sepet tutarları gizlenir" icon={<ShoppingBag className="w-5 h-5 text-gf-accent-purple" />}>
                            <BasketFilterCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                        </BentoCard>
                        <BentoCard title="Minimum Değerlendirme" description="Restoranın minimum yorum sayısı" icon={<MessageSquare className="w-5 h-5 text-blue-400" />}>
                            <ReviewFilterCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                        </BentoCard>
                        <BentoCard title="Maksimum Süre" description="Maksimum teslimat süresi" icon={<Clock className="w-5 h-5 text-orange-400" />}>
                            <DeliveryFilterCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                        </BentoCard>

                        {/* Row 2: Large Panels & Toggles */}
                        <BentoCard
                            title="Engellenen Restoranlar"
                            description={`${settings.blockedRestaurants.length} restoran engellendi`}
                            icon={<Shield className="w-5 h-5 text-red-500" />}
                            className="md:col-span-2 md:row-span-2"
                        >
                            <BlockedRestaurantsCard
                                settings={settings}
                                unblockRestaurant={unblockRestaurant}
                                clearBlocklist={clearBlocklist}
                            />
                        </BentoCard>

                        <div className="col-span-1 md:col-span-2 space-y-4 h-full flex flex-col">
                            <BentoCard title="Diğer Filtreler" description="Ek filtreleme seçenekleri">
                                <TogglesCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                            </BentoCard>
                            <BentoCard title="Maksimum Mesafe" description="Bu mesafeden uzak olanlar gizlenir" icon={<MapPin className="w-5 h-5 text-red-400" />}>
                                <DistanceFilterCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                            </BentoCard>
                        </div>

                        {/* Row 3: Admin / Section Visibility */}
                        <BentoCard title="Görünüm Ayarları" description="Sayfa bölümlerini gizle/göster" icon={<Layout className="w-5 h-5 text-purple-400" />} className="md:col-span-2">
                            <SectionVisibilityCard settings={settings} updateSetting={updateSetting} disabled={!settings.isEnabled} variant="default" />
                        </BentoCard>

                        <BentoCard title="Sistem" description="Yedekleme ve sıfırlama" icon={<Save className="w-5 h-5 text-green-400" />} className="md:col-span-2">
                            <BackupCard onExport={onExport} onImport={onImport} onReset={onReset} />
                        </BentoCard>
                    </BentoGrid>

                    <footer className="text-center text-gray-500 text-sm mt-12">
                        Değişiklikler anında kaydedilir ✨ • v1.0.0
                    </footer>
                </div>
            </div>
        );
    }


    // --- Legacy Popup Mode (Simplified List) ---
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
                <FilterSettings
                    settings={settings}
                    updateSetting={updateSetting}
                    disabled={!settings.isEnabled}
                    variant="compact"
                />

                <div className="p-4 bg-gf-dark-800 rounded-xl border border-gf-dark-700 text-center space-y-3">
                    <Shield className="w-8 h-8 text-gf-accent-purple mx-auto opacity-50" />
                    <p className="text-sm text-gray-400">
                        Bu pencere sadece hızlı ayarlar içindir.
                        Engellenenler ve gelişmiş yönetim için panelinizi kullanın.
                    </p>
                    <button
                        onClick={() => {
                            if (chrome.tabs) {
                                chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
                            } else {
                                window.open('index.html?page=settings', '_blank');
                            }
                        }}
                        className="w-full py-2 bg-gf-accent-purple/10 text-gf-accent-purple rounded-lg text-sm font-medium hover:bg-gf-accent-purple/20 transition-colors"
                    >
                        Tam Ekran Panelini Aç
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper removed as it's not used in this file anymore (moved to BlockedRestaurantsCard)
