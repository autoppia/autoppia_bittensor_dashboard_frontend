"use client";

import BannerText from "@/app/shared/banner-text";
import TaskActionItem from "@/app/tasks/[id]/task-action-item";
import { Text } from "rizzui";
import { PiArrowRight, PiClock, PiKeyboard, PiCursorClick, PiScroll } from "react-icons/pi";

export default function TaskTopMiner() {
    return (
        <div className="w-full border border-muted bg-gray-0 dark:bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between">
                <Text className="text-white text-xl font-medium mb-2">Top Miner</Text>
                <div className="flex flex-wrap gap-6 mr-4">
                    <BannerText color="#2465FF" text="UID: 120" />
                    <BannerText color="#22C55E" text="5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe" />
                    <BannerText color="#FF1A1A" text="Score: 0.95" />
                    <BannerText color="#F5A623" text="Response Time: 10s" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border border-muted rounded-lg p-4">
                    <Text className="text-white text-lg font-medium mb-2">Actions</Text>
                    <div className="flex flex-col gap-2">
                        <TaskActionItem icon={<PiArrowRight />} content="NavigateAction(url='http://localhost:8000/', selector=null, go_forward=false, go_back=false)" />
                        <TaskActionItem icon={<PiClock />} content="WaitAction(selector=null, time_seconds=5, timeout_seconds=5.0)" />   
                        <TaskActionItem icon={<PiKeyboard />} content="TypeAction(selector='//html/body/main/div/div[2]/div[2]/div[1]', text='Sample Text')" />
                        <TaskActionItem icon={<PiCursorClick />} content="ClickAction(selector='//html/body/main/div/div[2]/div[2]/div[1]')" />
                        <TaskActionItem icon={<PiScroll />} content="ScrollAction(value=null, up=false, down=true)" />   
                    </div>
                </div>
                <div className="border border-muted rounded-lg p-4">
                    <Text className="text-white text-lg font-medium mb-2">Generated GIF</Text>
                    <div className="flex justify-center items-center w-full h-[400px] border border-muted rounded-lg">
                        <div className="text-4xl font-bold text-white">Comming soon</div>
                    </div>
                </div>
            </div>
        </div>
    );
}