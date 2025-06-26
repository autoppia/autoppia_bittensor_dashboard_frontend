"use client";

import { Title } from 'rizzui/typography';
import { websitesData } from '@/data/websites-data';
import WebsiteItem from './website-item';

export default function Websites() {
  return (
    <div className="flex flex-col w-full px-6 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:max-w-7xl 2xl:mx-auto items-center">
      <Title 
        as="h1"
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center leading-tight mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10"
      >
        Realistic sandbox website replicas for agents to explore
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
        {websitesData.map((website, index) => (
          <WebsiteItem key={index} website={website} />
        ))}
      </div>
    </div>
  );
}