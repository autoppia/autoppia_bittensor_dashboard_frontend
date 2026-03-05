export function exportToCSV(
  data: Record<string, unknown>[],
  header: string,
  fileName: string
) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    `${header}\n` +
    data
      .map((row) => {
        if (typeof row === 'object' && row !== null) {
          return flattenObject(row).join(',');
        }
        return ''; // Return an empty string if row is not an object
      })
      .join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName + '.csv');
  document.body.appendChild(link);
  link.click();
}

function flattenObject(obj: Record<string, unknown>): string[] {
  const values: string[] = [];

  for (const key in obj) {
    const val = obj[key];
    if (typeof val === 'object' && val !== null) {
      const childValues = flattenObject(val as Record<string, unknown>);
      if (childValues.length > 0) {
        values.push(childValues.join(' '));
      }
    } else {
      values.push(String(val));
    }
  }

  return values;
}
