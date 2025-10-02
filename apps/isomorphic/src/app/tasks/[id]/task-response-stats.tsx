"use client";

import { Title, Text, Button } from "rizzui";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import MetricCard from "@core/components/cards/metric-card";
import {
    PiCaretLeftBold,
    PiCaretRightBold,
    PiCubeDuotone,
    PiCheckFatDuotone,
    PiTrashDuotone,
    PiEyeDuotone,
    PiChartBarDuotone,
    PiClockDuotone,
} from 'react-icons/pi';

const responseStatsData = [
    {
        label: "Total Responses",
        value: "256",
        icon: PiCubeDuotone,
        fillColor: "#2465FF",
    },
    {
        label: "Success Responses",
        value: "180",
        icon: PiCheckFatDuotone,
        fillColor: "#22C55E",
    },
    {
        label: "Failed Responses",
        value: "76",
        icon: PiTrashDuotone,
        fillColor: "#FF1A1A",
    },
    {
        label: "Unique Responses",
        value: "240",
        icon: PiEyeDuotone,
        fillColor: "#F5A623",
    },
    {
        label: "Avg Score",
        value: "0.633",
        icon: PiChartBarDuotone,
        fillColor: "#00CEC9",
    },
    {
        label: "Avg Response Time",
        value: "34.458s",
        icon: PiClockDuotone,
        fillColor: "#F1416C",
    },
]

// @md:grid-cols-2 @2xl:grid-cols-3 @3xl:grid-cols-4 @7xl:grid-cols-5
export default function TaskResponseStats() {
    const {
        sliderEl,
        sliderPrevBtn,
        sliderNextBtn,
        scrollToTheRight,
        scrollToTheLeft,
    } = useScrollableSlider();

    return (
        <div className="relative flex w-auto items-center overflow-hidden">
            <Button
                title="Prev"
                variant="text"
                ref={sliderPrevBtn}
                onClick={() => scrollToTheLeft()}
                className="!absolute left-0 top-0 z-10 !h-full w-8 !justify-start rounded-none bg-gradient-to-r from-white via-white to-transparent px-0 text-gray-500 hover:text-black dark:from-gray-50/80 dark:via-gray-50/80 3xl:hidden"
            >
                <PiCaretLeftBold className="h-5 w-5" />
            </Button>
            <div className="w-full overflow-hidden">
                <div
                    ref={sliderEl}
                    className="custom-scrollbar grid grid-flow-col gap-5 overflow-x-auto scroll-smooth"
                >
                    {responseStatsData.map((stat: any, index: number) => {
                        const Icon = stat.icon;
                        return (
                            <MetricCard
                                key={`response-stat-${index}`}
                                title=""
                                metric=""
                                className="min-w-[276px] max-w-full flex-row-reverse"
                            >
                                <div className="flex items-center justify-between gap-5">
                                    <div>
                                        <Text className="text-sm font-medium text-gray-500">
                                            {stat.label}
                                        </Text>
                                        <Title
                                            as="h4"
                                            className="text-xl font-semibold text-gray-900"
                                        >
                                            {stat.value}
                                        </Title>
                                    </div>
                                    <span
                                        style={{ backgroundColor: stat.fillColor }}
                                        className="flex rounded-[14px] p-2.5 text-gray-0 dark:text-gray-900"
                                    >
                                        <Icon className="h-auto w-[30px]" />
                                    </span>
                                </div>
                            </MetricCard>
                        );
                    })}
                </div>
                <Button
                    title="Next"
                    variant="text"
                    ref={sliderNextBtn}
                    onClick={() => scrollToTheRight()}
                    className="!absolute right-0 top-0 z-10 !h-full w-8 !justify-end rounded-none bg-gradient-to-l from-white via-white to-transparent px-0 text-gray-500 hover:text-black dark:from-gray-50/80 dark:via-gray-50/80 3xl:hidden"
                >
                    <PiCaretRightBold className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
