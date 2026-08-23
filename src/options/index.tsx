import React from 'react';
import ReactDOM from 'react-dom/client';
import SettingsPage from '../popup/components/SettingsPage';
import { useSettings } from '../popup/hooks/useSettings';
import { DEFAULT_SETTINGS } from '../shared/types';
import '../popup/index.css';

function OptionsApp() {
    const {
        settings,
        isLoading,
        updateSetting,
        clearBlocklist,
        unblockRestaurant,
        blockKeyword,
        unblockKeyword,
        replaceSettings,
    } = useSettings();

    // Export settings using File System Access API
    const handleExport = async () => {
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: settings,
        };

        const jsonString = JSON.stringify(exportData, null, 2);

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
        const suggestedName = `GetirFiltreYedek${timestamp}.json`;

        try {
            // Use File System Access API for native Save dialog
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            const writable = await handle.createWritable();
            await writable.write(jsonString);
            await writable.close();
        } catch (err: any) {
            // User cancelled or API not supported
            if (err.name !== 'AbortError') {
                console.error('[GetirFiltre] Export failed:', err);
                // Fallback to anchor download
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = suggestedName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
    };

    const handleImport = async (importedSettings: any) => {
        await replaceSettings(importedSettings);
    };

    const handleReset = async () => {
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
                blockKeyword={blockKeyword}
                unblockKeyword={unblockKeyword}
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
