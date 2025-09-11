'use client';

import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { MinerDataType, minersData } from '@/data/miners-data';
import { minerColumns } from '@/app/shared/miners-table/columns';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { Flex, Input, TableVariantProps, Title } from 'rizzui';
import TablePagination from '@core/components/table/pagination';

export default function MinersTable() {
    const { table, setData } = useTanStackTable<MinerDataType>({
        tableData: minersData,
        columnConfig: minerColumns,
        options: {
            initialState: {
                pagination: {
                    pageIndex: 0,
                    pageSize: 10,
                },
            },
            enableColumnResizing: false,
        },
    });

    return (
        <>
            <Flex
                direction="col"
                justify="between"
                className="mb-4 xs:flex-row xs:items-center"
            >
                <Title as="h3" className="text-base font-semibold sm:text-lg">
                    All Miner Results
                </Title>
                <Input
                    type="search"
                    clearable={true}
                    placeholder="Search miner..."
                    onClear={() => table.setGlobalFilter('')}
                    value={table.getState().globalFilter ?? ''}
                    prefix={<PiMagnifyingGlassBold className="size-4" />}
                    onChange={(e) => table.setGlobalFilter(e.target.value)}
                    className="w-full xs:max-w-60"
                />
            </Flex>
            <Table
                table={table}
                variant="modern"
                classNames={{ rowClassName: 'last:!border-b-0' }}
            />
            <TablePagination table={table} className="mt-4" />
        </>
    );
}
