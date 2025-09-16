'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const data: any[] = [];
for (let i = 0; i < 256; i++) {
    data.push({
        name: i.toString(),
        score: Math.random().toFixed(2)
    });
}
data.sort((a, b) => a.score - b.score);

export default function TaskScoreChart() {
    return (
        <WidgetCard title={'Miner Scores'}>
            <div className="mt-5 aspect-[1060/660] w-full h-[300px] lg:mt-7">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            left: -20,
                        }}
                        className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
                    >
                        <defs>
                            <linearGradient id="scoreAreaChart" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#2465FF"
                                    className="[stop-opacity:0.3] dark:[stop-opacity:0.2]"
                                />
                                <stop offset="95%" stopColor={'#2465FF'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#2465FF"
                            fill="url(#scoreAreaChart)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}