"use client";

import { Text } from "rizzui";
import cn from "@core/utils/class-names";

interface TaskActionItemProps {
    icon: React.ReactNode;
    content: string;
    className?: string;
}

export default function TaskActionItem({ 
    icon, 
    content, 
    className 
}: TaskActionItemProps) {
    return (
        <div className={cn("w-full flex items-center blur-sm bg-gray-100 rounded-full px-3 py-2 italic text-gray-800", className)}>
            {icon}
            <Text className="ms-2 font-medium w-full truncate">{content}</Text>
        </div>
    );
}