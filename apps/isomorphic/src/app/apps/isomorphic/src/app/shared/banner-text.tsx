"use client";

import { Badge, Text } from "rizzui";
import cn from "@core/utils/class-names";

interface BannerTextProps {
    color: string;
    text: string;
    className?: string;
}

export default function BannerText({ 
    color, 
    text, 
    className 
}: BannerTextProps) {
    return (
        <div className={cn("flex items-center", className)}>
            <Badge
                renderAsDot
                style={{ backgroundColor: color }}
            />
            <Text
                className="ms-2 font-medium"
                style={{ color: color }}
            >
                {text}
            </Text>
        </div>
    );
}