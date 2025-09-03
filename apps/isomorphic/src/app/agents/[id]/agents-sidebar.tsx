'use client';

import cn from '@core/utils/class-names';
import { Title } from 'rizzui/typography';
import { AgentsSidebarMenu } from './agents-sidebar-menu';

export default function AgentsSidebar({ className }: { className?: string }) {
    return (
        <aside
            className={cn(
                'fixed bottom-0 start-0 z-50 h-[calc(100vh-90px)] w-[284px] xl:p-5 2xl:w-[308px]',
                className
            )}
        >
            <div className="h-full bg-gray-900 p-1.5 pl-0 pr-0 border dark:bg-gray-50 xl:rounded-2xl">
                <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto scroll-smooth">
                    <Title
                        as="h3"
                        className="mt-2 mb-2 pt-2 pb-4 truncate px-6 text-bold border-b uppercase tracking-widest 2xl:px-8"
                    >
                        Top Agents
                    </Title>
                    <AgentsSidebarMenu />
                </div>
            </div>
        </aside>
    );
}