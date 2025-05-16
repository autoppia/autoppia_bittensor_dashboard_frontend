"use client";

import { useParams } from 'next/navigation';
import PageHeader from '@/app/shared/page-header';
import AgentsSidebar from './agents-sidebar';
import AgentsDetail from "./agents-detail"
import AgentsSummary from "./agents-summary"
import { getAgentById, getAgentSummaryData } from '@/data/query';

export default function Details() {
    const { id } = useParams();
    const selectedAgent = getAgentById(id as string);
    const agentSummaryData = getAgentSummaryData(id as string);

    return (
        <div className="flex justify-end w-full">
            <AgentsSidebar className="fixed hidden xl:block" />
            <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
                <PageHeader
                    title={selectedAgent?.name ? selectedAgent.name : "Agent Not Found"}
                    className='mt-4'
                />
                <div className='w-full grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6'>
                    <AgentsDetail className="xl:col-span-8" />
                    <AgentsSummary
                        className="xl:col-span-4"
                        {...agentSummaryData}
                    />
                </div>
            </div>
        </div>
    );
}
