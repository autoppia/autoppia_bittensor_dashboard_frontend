"use client"

import { Title } from 'rizzui/typography';
import { websitesData } from '@/data/websites-data';
import WebsiteItem from './website-item';

export default function Websites() {
    return (
        <div className='flex flex-col w-full px-6 md:px-12 lg:px-24 items-center'>
            <Title className='text-4xl font-bold text-center leading-tight mt-10 mb-10'>
                Realistic sandbox website replicas for agents to explore
            </Title>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {websitesData.map((website, index) => (
                    <WebsiteItem key={index} website={website} />
                ))}
            </div>
        </div>
    )
}
