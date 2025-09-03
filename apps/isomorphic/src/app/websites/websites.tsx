"use client";

import { Title } from 'rizzui/typography';
import { websitesData } from '@/data/websites-data';
import WebsiteItem from './website-item';
import { PiPlayCircleDuotone } from 'react-icons/pi';

export default function Websites() {
  return (
    <div className="flex flex-col w-full px-6 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:max-w-7xl 2xl:mx-auto items-center relative">
      {/* Running indicator in top right corner */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium animate-pulse">
        <PiPlayCircleDuotone className="h-4 w-4" />
        <span className="hidden sm:inline">Running</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
      </div>
      
      <Title 
        as="h1"
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center leading-tight mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 md:mb-10"
      >
        AI Agent Training Sandbox
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
        {websitesData.map((website, index) => (
          <WebsiteItem key={index} website={website} />
        ))}
      </div>
    </div>
  );
}