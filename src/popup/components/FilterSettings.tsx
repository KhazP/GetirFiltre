import { UserSettings, UpdateSetting } from '../../shared/types';
import RatingFilterCard from './cards/RatingFilterCard';
import BasketFilterCard from './cards/BasketFilterCard';
import ReviewFilterCard from './cards/ReviewFilterCard';
import DistanceFilterCard from './cards/DistanceFilterCard';
import DeliveryFilterCard from './cards/DeliveryFilterCard';
import TogglesCard from './cards/TogglesCard';
import SectionVisibilityCard from './cards/SectionVisibilityCard';

interface FilterSettingsProps {
    settings: UserSettings;
    updateSetting: UpdateSetting;
    disabled?: boolean;
    variant?: 'default' | 'compact';
}

export default function FilterSettings({
    settings,
    updateSetting,
    disabled = false,
    variant = 'compact'
}: FilterSettingsProps) {
    return (
        <div className="space-y-4">
            <RatingFilterCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />

            <BasketFilterCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />

            <ReviewFilterCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />

            <DistanceFilterCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />

            <DeliveryFilterCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />

            <TogglesCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />

            <SectionVisibilityCard
                settings={settings}
                updateSetting={updateSetting}
                disabled={disabled}
                variant={variant}
            />
        </div>
    );
}

