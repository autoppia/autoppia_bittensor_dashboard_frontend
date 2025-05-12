'use client';

import { useState, useEffect, useRef } from 'react';
import cn from '@core/utils/class-names';
import { Title } from 'rizzui/typography';
import { Radio, RadioGroup, Checkbox, CheckboxGroup } from 'rizzui';
import { websitesData } from '@/data/websites-data';

type FilterBoardProps = {
    classname?: string;
    setTableData: (data: any) => void;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function FilterBoard({ classname, setTableData }: FilterBoardProps) {
    const [period, setPeriod] = useState<string>("All");
    const [websites, setWebsites] = useState<string[]>(websitesData.map((w) => w.value));
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`${apiUrl}/tasks/filtered/?period=${period}&websites=${websites.join(',')}`);
                const data = await response.json();
                setTableData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [websites, period, apiUrl, setTableData]);

    return (
        <div className={cn('flex flex-col rounded-lg border border-muted', classname)}>
            <Title className="px-6 py-3 text-xl font-bold border-b">Filters</Title>
            <div className='px-4 sm:px-8 py-4'>
                <Title className='text-lg font-bold mb-4'>Period</Title>
                <RadioGroup
                    value={period}
                    setValue={setPeriod}
                    className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4 ms-4'
                >
                    <Radio
                        label="All"
                        value="All"
                    />
                    <Radio
                        label="24 Hours"
                        value="Day"
                    />
                    <Radio
                        label="7 Days"
                        value="Week"
                    />
                    <Radio
                        label="30 Days"
                        value="Month"
                    />
                </RadioGroup>
                <Title className='text-lg font-bold mt-4 mb-4'>Websites</Title>
                <CheckboxGroup
                    values={websites}
                    setValues={setWebsites}
                    className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-4 ms-4'
                >
                    {websitesData.map((website) => (
                        <Checkbox
                            key={website.value}
                            label={website.name}
                            value={website.value}
                        />
                    ))}
                </CheckboxGroup>
            </div>
        </div>
    );
}