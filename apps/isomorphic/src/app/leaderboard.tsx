"use client";

import {
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ComposedChart,
    CartesianGrid,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import { Title, Text } from "rizzui/typography";
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { metricsData } from '@/data/metrics-data';

const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    return (
        <g>
            <image
                href={value.imageUrl}
                x={x + width + 15}
                y={y + height / 2 - 15}
                width={30} 
                height={30}
            />
            <text x={x + width + 70} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="middle">
                {`${value.percentage}%`}
            </text>
        </g>
    );
};

export default function Leaderboard() {
    return (
        <div className='flex flex-col w-full px-6 md:px-12 lg:px-24 xl:px-36 items-center'>
            <Title className='text-4xl font-bold text-center leading-tight mt-10 mb-4'>
                This Sentence Will Explain the Purpose of This Website
            </Title>
            <Text className='text-3xl font-bold mb-10'>
                Description for Title
            </Text>
            <Text className='text-3xl font-bold text-white'>
                REAL Score
            </Text>
            <div className='w-full min-w-[600px] h-[600px] text-white mb-10'>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        layout="vertical"
                        margin={{ top: 20, bottom: -10, left: -50, right: 100 }}
                        barCategoryGap={100}
                        barSize={35}
                        data={metricsData}
                        className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
                    >
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis
                            dataKey="framework"
                            type="category"
                            style={{ fontSize: 12, fontWeight: 500, fill: '#fff' }}
                            width={300}
                            axisLine={true}
                            tickLine={false}
                        />
                        <CartesianGrid
                            horizontal={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="label.percentage" fill="#3872FA" >
                            <LabelList dataKey="label" content={<CustomLabel />} />
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
