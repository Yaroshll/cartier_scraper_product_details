import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export function saveToCSVAndExcel(productRow, extraImages) {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .slice(0, 16)
    .replace("T", "_")
    .replace(":", "-");
  const fileName = `cartier_products_${timestamp}`;
  const outputDir = './output';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const fullRows = [productRow, ...extraImages];
  const ws = xlsx.utils.json_to_sheet(fullRows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Products');

  const csvPath = path.join(outputDir, `${fileName}.csv`);
  const excelPath = path.join(outputDir, `${fileName}.xlsx`);

  xlsx.writeFile(wb, csvPath, { bookType: 'csv' });
  xlsx.writeFile(wb, excelPath);
}
