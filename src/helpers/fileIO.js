import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export function saveToCSVAndExcel(productRow, extraImages = []) {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .slice(0, 16)
    .replace("T", "_")
    .replace(":", "-");
  const fileName = `cartier_products_${timestamp}`;
  const outputDir = './output';
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Handle case where extraImages might be undefined or not iterable
    const imagesToProcess = Array.isArray(extraImages) ? extraImages : [];
    
    // Prepare data for export
    const exportData = {
      // Main product data
      product: {
        ...productRow,
        // Ensure Image Src is always a string
        "Image Src": productRow["Image Src"] || ''
      },
      // Additional images (if any)
      extraImages: imagesToProcess.map(img => ({
        ...img,
        // Ensure Image Src is always a string
        "Image Src": img["Image Src"] || ''
      }))
    };

    // Create worksheets
    const productWs = xlsx.utils.json_to_sheet([exportData.product]);
    const imagesWs = exportData.extraImages.length > 0 
      ? xlsx.utils.json_to_sheet(exportData.extraImages) 
      : null;

    // Create workbook
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, productWs, 'Product');
    
    if (imagesWs) {
      xlsx.utils.book_append_sheet(wb, imagesWs, 'Additional Images');
    }

    // Save files
    const csvPath = path.join(outputDir, `${fileName}.csv`);
    const excelPath = path.join(outputDir, `${fileName}.xlsx`);

    // Write CSV (main product data only)
    xlsx.writeFile(wb, csvPath, { bookType: 'csv', sheet: 'Product' });
    
    // Write Excel (all data)
    xlsx.writeFile(wb, excelPath);

    console.log(`Files saved successfully: ${csvPath}, ${excelPath}`);
    return { csvPath, excelPath };

  } catch (error) {
    console.error('Error saving files:', error);
    throw error;
  }
}