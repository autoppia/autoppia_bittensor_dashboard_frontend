export function CustomYAxisTick({
  x,
  y,
  payload,
  prefix,
  postfix,
  decimals,
}: any) {
  const rawValue = payload?.value;
  let formattedValue = rawValue;

  if (typeof rawValue === "number" && typeof decimals === "number") {
    formattedValue = rawValue.toFixed(decimals);
  } else if (typeof rawValue?.toLocaleString === "function") {
    formattedValue = rawValue.toLocaleString();
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" className="fill-gray-500">
        {prefix}
        {formattedValue}
        {postfix}
      </text>
    </g>
  );
}
