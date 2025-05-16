"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import { WebsiteDataType } from '@/data/websites-data';
import {
    PiLightbulbDuotone,
    PiEyeDuotone,
} from "react-icons/pi";
import { useModal } from '@/app/shared/modal-views/use-modal';
import WebsiteInfo from './website-info';

export default function WebsiteItem({ website }: { website: WebsiteDataType }) {
    const { openModal } = useModal();

    return (
        <WidgetCard
            title={<span className='text-2xl font-bold'>{website.name}</span>}
            action={<span className='text-md font-bold'>{`Similar to ${website.origin}`}</span>}
            className='!p-4'
        >
            <Image
                src="/website_preview.webp"
                alt={website.name}
                className='rounded-lg mt-4'
                width={500}
                height={500}
            />
            <div className='mt-4'>
                <Button
                    onClick={() =>
                        openModal({
                            view: (<WebsiteInfo title={website.name} />),
                            customSize: 480,
                        })
                    }
                    size="sm"
                    rounded="pill"
                >
                    <PiLightbulbDuotone className="me-1.5 h-[17px] w-[17px]" />
                    About
                </Button>
                <Link href={website.href} target='_blank'>
                    <Button
                        size="sm"
                        rounded="pill"
                        className='ms-2'
                    >
                        <PiEyeDuotone className="me-1.5 h-[17px] w-[17px]" />
                        Explore
                    </Button>
                </Link>
            </div>
        </WidgetCard>
    )
}

