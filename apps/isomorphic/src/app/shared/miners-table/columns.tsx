'use client';

import Image from 'next/image';
import { createColumnHelper } from '@tanstack/react-table';
import { MinerDataType } from '@/data/miners-data';
import BannerText from '@/app/shared/banner-text';

const columnHelper = createColumnHelper<MinerDataType>();

export const minerColumns = [
  columnHelper.display({
    id: 'uid',
    size: 50,
    header: 'UID',
    cell: ({ row }) => <>{row.original.uid}</>,
  }),
  columnHelper.accessor('hotkey', {
    id: 'hotkey',
    size: 300,
    header: 'Hotkey',
    enableSorting: false,
    cell: ({ row }) => <div className="flex items-center gap-2">
      <Image
        src={`/miners/${row.original.uid % 50}.svg`}
        alt="Hotkey"
        className="w-6 h-6 rounded-full"
        width={24}
        height={24}
      />
      <span>{row.original.hotkey}</span>
    </div>,
  }),
  columnHelper.accessor('success', {
    id: 'success',
    size: 50,
    header: 'Success',
    cell: ({ row }) => (
      <>
        {row.original.success ?
          <BannerText color="#22C55E" text="Success" /> :
          <BannerText color="#FF1A1A" text="Failed" />
        }
      </>
    ),
  }),
  columnHelper.accessor('score', {
    id: 'score',
    size: 50,
    header: 'Score',
    cell: ({ row }) => (
      <>
        {row.original.score > 0 ?
          <span className="text-green-500">{row.original.score.toFixed(1)}</span> :
          <span className="text-red-500">{row.original.score.toFixed(1)}</span>
        }
      </>
    ),
  }),
  columnHelper.accessor('duration', {
    id: 'duration',
    size: 50,
    header: 'Duration',
    cell: ({ row }) => <>{row.original.duration}</>,
  }),
  columnHelper.accessor('actions', {
    id: 'actions',
    size: 500,
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="custom-scrollbar overflow-y-auto scroll-smooth max-h-[95px]">
        {row.original.actions.map((action, index) => (
          <div
            key={`miner-action-${row.original.uid}-${index}`}
            className="bg-gray-100 blur-sm rounded-full px-2 py-1 mb-1 italic text-gray-800 text-sm"
          >
            {action}
          </div>
        ))}
      </div>
    ),
  }),
];
