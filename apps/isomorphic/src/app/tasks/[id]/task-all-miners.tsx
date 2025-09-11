"use client";

import WidgetCard from '@core/components/cards/widget-card';
import MinersTable from '@/app/shared/miners-table/table';

export default function TaskAllMiners() {
    return (
        <WidgetCard className='text-gray-800'>
            <MinersTable />
        </WidgetCard>
    )
}