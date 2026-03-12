import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns based on content
  const maxWidths = data.reduce((acc: any, row: any) => {
    Object.keys(row).forEach((key) => {
      const val = row[key] ? row[key].toString().length : 0;
      acc[key] = Math.max(acc[key] || key.length, val);
    });
    return acc;
  }, {});

  worksheet['!cols'] = Object.keys(maxWidths).map((key) => ({
    wch: Math.min(maxWidths[key] + 2, 50), // Cap width at 50 to prevent crazy long columns
  }));

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
