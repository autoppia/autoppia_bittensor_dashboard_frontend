'use client';

import { Flex, Text } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const RADIAL_COLORS = ['#BBD6FF', '#0070F3']
const HORIZONTAL_COLORS = ['#0070F3', '#3962F7', '#2750AF', '#BBD6FF'];

type AgentsSummaryProps = {
  easy?: number;
  medium?: number;
  hard?: number;
  total?: number;
  className?: string;
}

export default function AgentsSummary(props: AgentsSummaryProps) {
  const { easy, medium, hard, total, className } = props;
  const radialData = [
    { label: "failed", value: 100 - (total as number) },    
    { label: "success", value: total }  
  ]
  const horizontalData = [
    { label: "Total Tasks", value: total },
    { label: "Easy Tasks", value: easy },
    { label: "Medium Tasks", value: medium },
    { label: "Hard Tasks", value: hard }
  ]

  return (
    <WidgetCard
      title={'Used Storage'}
      headerClassName="hidden"
      className={className}
    >
      <div className="h-[320px] w-full @sm:py-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
            <Pie
              data={radialData}
              cornerRadius={40}
              innerRadius={100}
              outerRadius={120}
              paddingAngle={10}
              fill="#BFDBFE"
              stroke="rgba(0,0,0,0)"
              dataKey="value"
            >
              <Label
                width={30}
                position="center"
                content={
                  <CustomLabel value1={radialData[1].value?.toFixed(0)} value2={'For 100 Tasks'} />
                }
              ></Label>
              {radialData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={RADIAL_COLORS[index % RADIAL_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        {horizontalData.map((item, index) => (
          <Flex
            key={item.label}
            align="center"
            justify="between"
            className="mb-4 gap-0 border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0"
          >
            <Flex align="center" className="gap-0">
              <span
                className="me-2 size-2 rounded-full"
                style={{ backgroundColor: HORIZONTAL_COLORS[index] }}
              />
              <Text
                as="span"
                className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700"
              >
                {item.label}
              </Text>
            </Flex>
            <Text as="span">{item.value?.toFixed(1)}%</Text>
          </Flex>
        ))}
      </div>
    </WidgetCard>
  );
}

function CustomLabel(props: any) {
  const { cx, cy } = props.viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 10}
        fill="#111111"
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan alignmentBaseline="middle" fontSize="36px">
          {props.value1}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 20}
        fill="#666666"
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan fontSize="14px">{props.value2}</tspan>
      </text>
    </>
  );
}
