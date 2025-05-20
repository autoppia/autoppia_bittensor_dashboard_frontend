"use client";

import { useRouter } from 'next/navigation';
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
import { getLeaderboardData } from '@/data/query';

const CustomLabel = (props: any) => {
    const { x, y, width, height, value, data } = props;
    const agent = data.find((item: any) => item.name === value);
    const imageUrl = agent?.imageUrl;
    const successRate = agent?.successRate;

    return (
        <g>
            <image
                href={imageUrl}
                x={x + width + 15}
                y={y + height / 2 - 15}
                width={30}
                height={30}
            />
            <text x={x + width + 70} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="middle">
                {`${successRate.toFixed(1)}%`}
            </text>
        </g>
    );
};

export default function Leaderboard() {
    const router = useRouter();
    const leaderboardData = getLeaderboardData();

    return (
        <div className='flex flex-col w-full px-6 md:px-12 lg:px-24 xl:px-36 items-center'>
            <Title className='text-5xl font-bold text-center leading-tight mt-10 mb-10'>
                Infinite Web Arena Leaderboard
            </Title>
            <Text className='text-4xl font-bold text-white'>
                IWA Score
            </Text>
            <div className='w-full min-w-[600px] h-[600px] text-white mb-10'>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        layout="vertical"
                        margin={{ top: 20, bottom: -10, left: -50, right: 100 }}
                        barCategoryGap={100}
                        barSize={35}
                        data={leaderboardData}
                        className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
                    >
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#FF7E5F" />
                                <stop offset="100%" stopColor="#FEB47B" />
                            </linearGradient>
                        </defs>
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            style={{ fontSize: 12, fontWeight: 500, fill: '#fff' }}
                            width={300}
                            axisLine={true}
                            tickLine={false}
                        />
                        <CartesianGrid
                            horizontal={false}
                        />
                        <Tooltip content={<CustomTooltip postfix='%' formattedNumber />} />
                        <Bar
                            dataKey="successRate"
                            fill="url(#barGradient)"
                            onClick={(data) => router.push(data.href)}
                            className="cursor-pointer"
                        >
                            <LabelList dataKey="name" content={<CustomLabel data={leaderboardData} />} />
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
