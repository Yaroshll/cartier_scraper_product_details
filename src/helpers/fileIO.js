import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { getTodayDate } from './utils.js';

export function saveDataAsCSVAndExcel(data) {
  const headers = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Variant SKU',
    'Variant Price',
    'Variant Compare At Price',
    'Cost per item',
    'Image Src',
    'Variant Image',
    'Variant Fulfillment Service',
    'Variant Inventory Policy',
    'Variant Inventory Tracker',
    'Type',
    'Vendor',
    'Tags',
    'Status',
    'Published',
    'product.metafields.custom.original_prodect_url'
  ];

  const rows = data.map(row => ({
    Handle: row.Handle,
    Title: row.Title,
    'Body (HTML)': row.BodyHTML,
    'Variant SKU': row.SKU,
    'Variant Price': row.VariantPrice,
    'Variant Compare At Price': row.CompareAtPrice,
    'Cost per item': row.CostPerItem,
    'Image Src': row.ImageSrc,
    'Variant Image': row.ImageSrc,
    'Variant Fulfillment Service': 'manual',
    'Variant Inventory Policy': 'deny',
    'Variant Inventory Tracker': 'shopify',
    Type: 'Jewellery',
    Vendor: 'cartier',
    Tags: row.Tags,
    Status: 'Active',
    Published: 'TRUE',
    'product.metafields.custom.original_prodect_url': row.originalURL
  }));

  const outputPath = './output';
  if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

  const today = getTodayDate();
  const filePath = path.join(outputPath, `cartier_products_${today}.xlsx`);

  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
  xlsx.writeFile(workbook, filePath);

  const csvPath = filePath.replace('.xlsx', '.csv');
  xlsx.writeFile(workbook, csvPath, { bookType: 'csv' });

  console.log(`Saved to ${filePath} and ${csvPath}`);
}
