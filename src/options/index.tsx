import React from 'react';
import ReactDOM from 'react-dom/client';
import SettingsPage from '../popup/components/SettingsPage';
import { useSettings } from '../popup/hooks/useSettings';
import '../popup/index.css';

function OptionsApp() {
    const {
        settings,
        isLoading,
        updateSetting,
        clearBlocklist,
        unblockRestaurant,
        replaceSettings,
    } = useSettings();

    // Export settings
    const handleExport = () => {
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: settings,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
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

    const handleImport = async (importedSettings: any) => {
        await replaceSettings(importedSettings);
    };

    const handleReset = async () => {
        // Import DEFAULT_SETTINGS if needed or just pass empty/default object
        // Since we don't have direct access to DEFAULT_SETTINGS here without import, 
        // let's assume SettingsPage or useSettings handles the default value logic 
        // or we import it. For now, rely on useSettings logic or import it.
        const { DEFAULT_SETTINGS } = await import('../shared/types');
        await replaceSettings(DEFAULT_SETTINGS);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gf-dark-950 flex items-center justify-center text-white">
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gf-dark-950 text-white">
            <SettingsPage
                settings={settings}
                onBack={() => { }} // No back button needed in full options page usually, or it acts as "Close"
                unblockRestaurant={unblockRestaurant}
                clearBlocklist={clearBlocklist}
                onImport={handleImport}
                onExport={handleExport}
                onReset={handleReset}
                isTabMode={true}
                updateSetting={updateSetting} // Pass this to support filters
            />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <OptionsApp />
    </React.StrictMode>
);
