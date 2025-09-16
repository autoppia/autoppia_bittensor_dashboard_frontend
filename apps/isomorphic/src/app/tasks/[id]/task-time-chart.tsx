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
        time: (30 + Math.random() * 20).toFixed(2)
    });
}
data.sort((a, b) => a.time - b.time);

export default function TaskTimeChart() {
    return (
        <WidgetCard title={'Miner Response Time'}>
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
                            <linearGradient id="timeAreaChart" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#22C55E"
                                    className="[stop-opacity:0.3] dark:[stop-opacity:0.2]"
                                />
                                <stop offset="95%" stopColor={'#22C55E'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="time"
                            stroke="#22C55E"
                            fill="url(#timeAreaChart)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}