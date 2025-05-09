"use client"

import { useState } from 'react';
import MinerScoreTable from '@/app/shared/table/score/table';
import MinerTimeTable from '@/app/shared/table/time/table'
import TableLayout from '@/app/shared/table/table-layout';
import FilterBoard from '@/app/shared/filter-board';

const pageHeader = {
    title: 'Leaderboard'
};

export default function Leaderboard() {
    const [view, setView] = useState<string>("score");

    return (
        <TableLayout
            title={pageHeader.title}
            view={view}
            setView={setView}
        >
            <div className='flex flex-col md:flex-row w-full gap-4'>
                <FilterBoard classname='w-full md:w-[270px] border-box'/>
                <div className='w-full md:w-[calc(100%-270px)]'>
                    {view == "score" && <MinerScoreTable />}
                    {view == "time" && <MinerTimeTable />}
                </div>
            </div>
        </TableLayout>
    );
}
