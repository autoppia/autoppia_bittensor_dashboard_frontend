'use client';

import { useEffect, useState } from 'react';
import { Text, Input } from 'rizzui';

type PriceFieldTypes = {
  label?: string;
  value: string[];
  onChange: (values: string[]) => void;
};

export default function PriceField({
  label = 'Amount',
  value,
  onChange,
}: Readonly<PriceFieldTypes>) {
  const [minPrice, setMinPrice] = useState(value[0] ?? '');
  const [maxPrice, setMaxPrice] = useState(value[1] ?? '');

  function handleMinPrice(val: string) {
    setMinPrice(val);
    onChange([val, maxPrice]);
  }

  function handleMaxPrice(val: string) {
    setMaxPrice(val);
    onChange([minPrice, val]);
  }

  useEffect(() => {
    setMinPrice(value[0]);
    setMaxPrice(value[1]);
  }, [value]);

  return (
    <div className="price-field flex items-center">
      <Text
        as="span"
        className="mr-2 whitespace-nowrap font-medium text-gray-500"
      >
        {label}
      </Text>
      <div className="flex items-center">
        <Input
          prefix={'$'}
          inputClassName="w-24 h-9"
          type="number"
          placeholder="0.00"
          min={0}
          value={minPrice}
          onChange={(event) => handleMinPrice(event.target.value)}
        />
        <Text as="span" className="mx-1.5 h-0.5 w-3 bg-gray-200" />
        <Input
          prefix={'$'}
          min={Number(minPrice)}
          inputClassName="w-24 h-9"
          type="number"
          placeholder="100.00"
          value={maxPrice}
          onChange={(event) => handleMaxPrice(event.target.value)}
          disabled={minPrice.length === 0}
        />
      </div>
    </div>
  );
}
