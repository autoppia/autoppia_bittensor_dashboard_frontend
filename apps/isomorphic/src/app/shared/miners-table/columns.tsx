'use client';

import { toCurrency } from '@core/utils/to-currency';
import { createColumnHelper } from '@tanstack/react-table';
import { MinerDataType } from '@/data/miners-data';

const columnHelper = createColumnHelper<MinerDataType>();

export const minerColumns = [
  columnHelper.display({
    id: 'uid',
    size: 50,
    header: 'UID',
    cell: ({ row }) => <>#{row.original.uid}</>,
  }),
  columnHelper.accessor('hotkey', {
    id: 'hotkey',
    size: 320,
    header: 'Hotkey',
    enableSorting: false,
    cell: ({ row }) => <>{row.original.hotkey}</>,
  }),
  columnHelper.accessor('score', {
    id: 'score',
    size: 50,
    header: 'Score',
    cell: ({ row }) => <>{row.original.score}</>,
  }),
  columnHelper.accessor('duration', {
    id: 'duration',
    size: 50,
    header: 'Duration',
    cell: ({ row }) => <>{row.original.duration}</>,
  }),
  columnHelper.accessor('actions', {
    id: 'actions',
    size: 400,
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="custom-scrollbar overflow-y-auto scroll-smooth max-h-[95px]">
        {row.original.actions.map((action, index) => (
          <div
            key={`miner-action-${row.original.uid}-${index}`}
            className="bg-gray-100 rounded-full px-2 py-1 mb-1 italic text-gray-800 text-sm"
          >
            {action}
          </div>
        ))}
      </div>
    ),
  }),
];
