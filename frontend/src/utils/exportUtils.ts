/**
 * Utility for exporting data to UTF-8 BOM CSV / Excel compatible files.
 * The \uFEFF prefix guarantees that Microsoft Excel on Windows renders Vietnamese diacritics
 * (tiếng Việt có dấu) with 100% crisp typography without mojibake/corrupted characters.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filenamePrefix: string
): void {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất file!');
    return;
  }

  // 1. Build Header row
  const headers = columns.map(c => escapeCsvValue(c.header)).join(',');

  // 2. Build Data rows
  const rows = data.map(item => {
    return columns.map(c => {
      const val = c.accessor(item);
      return escapeCsvValue(val);
    }).join(',');
  });

  // 3. Prepend UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');

  // 4. Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `${filenamePrefix}_${dateStr}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  let str = String(val);
  // If value contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  } else {
    str = '"' + str + '"';
  }
  return str;
}
