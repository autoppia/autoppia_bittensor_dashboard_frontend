"use client";

import { Badge, Text } from "rizzui";
import cn from "@core/utils/class-names";

interface BannerTextProps {
    color: string;
    text: string;
    className?: string;
    textClassName?: string;
    textColor?: string;
}

export default function BannerText({
    color,
    text,
    className,
    textClassName,
    textColor,
}: BannerTextProps) {
    return (
        <div className={cn("flex items-center", className)}>
            <Badge
                renderAsDot
                style={{ backgroundColor: color }}
            />
            <Text
                className={cn("ms-2 font-medium", textClassName)}
                style={{ color: textColor ?? color }}
            >
                {text}
            </Text>
        </div>
    );
}
