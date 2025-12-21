import { ReactNode } from 'react';

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2;
    title?: string;
    description?: string;
    icon?: ReactNode;
}

export default function BentoCard({
    children,
    className = '',
    colSpan = 1,
    rowSpan = 1,
    title,
    description,
    icon
}: BentoCardProps) {
    // Map span values to Tailwind classes
    const colSpanClasses = {
        1: 'col-span-1',
        2: 'col-span-1 md:col-span-2',
        3: 'col-span-1 md:col-span-3',
        4: 'col-span-1 md:col-span-2 lg:col-span-4',
    };

    const rowSpanClasses = {
        1: 'row-span-1',
        2: 'row-span-1 md:row-span-2',
    };

    return (
        <div
            className={`
                bg-gf-dark-800 rounded-2xl border border-gf-dark-700 overflow-hidden
                flex flex-col
                hover:border-gf-dark-600 transition-colors
                ${colSpanClasses[colSpan]} 
                ${rowSpanClasses[rowSpan]}
                ${className}
            `}
        >
            {(title || icon) && (
                <div className="p-4 md:p-5 pb-0 flex items-start justify-between gap-4">
                    <div>
                        {title && <h3 className="font-semibold text-gray-200">{title}</h3>}
                        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                    </div>
                    {icon && <div className="text-gray-400">{icon}</div>}
                </div>
            )}
            <div className={`p-4 md:p-5 flex-1 ${title ? 'pt-4' : ''}`}>
                {children}
            </div>
        </div>
    );
}
