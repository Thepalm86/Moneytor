import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  format?: 'png' | 'pdf' | 'csv' | 'json';
  quality?: number;
  width?: number;
  height?: number;
}

export interface ChartData {
  title: string;
  data: any[];
  metadata?: {
    period?: string;
    generatedAt?: Date;
    totalAmount?: number;
    currency?: string;
  };
}

/**
 * Export chart as PNG image
 */
export const exportChartAsPNG = async (
  elementId: string,
  options: ExportOptions = {}
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: options.quality || 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: options.width,
      height: options.height,
    });

    // Create download link
    const link = document.createElement('a');
    link.download = options.filename || 'chart.png';
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    throw error;
  }
};

/**
 * Export chart as PDF
 */
export const exportChartAsPDF = async (
  elementId: string,
  chartData: ChartData,
  options: ExportOptions = {}
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add title and metadata
    pdf.setFontSize(20);
    pdf.text(chartData.title, 20, 20);
    
    if (chartData.metadata) {
      pdf.setFontSize(10);
      let yPos = 30;
      
      if (chartData.metadata.period) {
        pdf.text(`Period: ${chartData.metadata.period}`, 20, yPos);
        yPos += 7;
      }
      
      if (chartData.metadata.generatedAt) {
        pdf.text(`Generated: ${chartData.metadata.generatedAt.toLocaleString()}`, 20, yPos);
        yPos += 7;
      }
      
      if (chartData.metadata.totalAmount !== undefined) {
        const currency = chartData.metadata.currency || '₪';
        pdf.text(`Total Amount: ${currency}${chartData.metadata.totalAmount.toLocaleString()}`, 20, yPos);
        yPos += 7;
      }
    }

    // Add chart image
    const imgWidth = 250;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);

    // Add data table if requested
    if (chartData.data.length > 0 && chartData.data.length <= 20) {
      const startY = 50 + imgHeight + 20;
      
      pdf.setFontSize(14);
      pdf.text('Data Summary', 20, startY);
      
      pdf.setFontSize(10);
      let tableY = startY + 10;
      
      // Table headers
      const headers = Object.keys(chartData.data[0]);
      let xPos = 20;
      headers.forEach(header => {
        pdf.text(header.charAt(0).toUpperCase() + header.slice(1), xPos, tableY);
        xPos += 50;
      });
      
      tableY += 7;
      
      // Table data
      chartData.data.slice(0, 15).forEach(row => {
        xPos = 20;
        headers.forEach(header => {
          const value = row[header];
          const displayValue = typeof value === 'number' ? 
            (header.includes('amount') ? `₪${value.toLocaleString()}` : value.toString()) :
            value?.toString() || '';
          
          pdf.text(displayValue.substring(0, 15), xPos, tableY);
          xPos += 50;
        });
        tableY += 5;
        
        if (tableY > 280) return; // Don't overflow page
      });
    }

    pdf.save(options.filename || 'chart-report.pdf');
  } catch (error) {
    console.error('Error exporting chart as PDF:', error);
    throw error;
  }
};

/**
 * Export data as CSV
 */
export const exportDataAsCSV = (
  chartData: ChartData,
  options: ExportOptions = {}
): void => {
  if (!chartData.data || chartData.data.length === 0) {
    throw new Error('No data to export');
  }

  try {
    // Get headers
    const headers = Object.keys(chartData.data[0]);
    
    // Create CSV content
    const csvContent = [
      // Title and metadata
      `"${chartData.title}"`,
      chartData.metadata?.period ? `"Period: ${chartData.metadata.period}"` : '',
      chartData.metadata?.generatedAt ? `"Generated: ${chartData.metadata.generatedAt.toISOString()}"` : '',
      '', // Empty line
      
      // Headers
      headers.map(header => `"${header}"`).join(','),
      
      // Data rows
      ...chartData.data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value}"` : value?.toString() || '';
        }).join(',')
      )
    ].filter(row => row !== '').join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', options.filename || 'chart-data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting data as CSV:', error);
    throw error;
  }
};

/**
 * Export data as JSON
 */
export const exportDataAsJSON = (
  chartData: ChartData,
  options: ExportOptions = {}
): void => {
  try {
    const exportData = {
      title: chartData.title,
      metadata: {
        ...chartData.metadata,
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0'
      },
      data: chartData.data
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', options.filename || 'chart-data.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting data as JSON:', error);
    throw error;
  }
};

/**
 * Universal export function that handles multiple formats
 */
export const exportChart = async (
  elementId: string,
  chartData: ChartData,
  options: ExportOptions = {}
): Promise<void> => {
  const format = options.format || 'png';
  
  try {
    switch (format) {
      case 'png':
        await exportChartAsPNG(elementId, options);
        break;
      case 'pdf':
        await exportChartAsPDF(elementId, chartData, options);
        break;
      case 'csv':
        exportDataAsCSV(chartData, options);
        break;
      case 'json':
        exportDataAsJSON(chartData, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error(`Error exporting chart as ${format}:`, error);
    throw error;
  }
};

/**
 * Show export options dialog
 */
export const showExportDialog = (
  onExport: (format: ExportOptions['format']) => void
) => {
  // This would typically be implemented with a proper dialog component
  // For now, we'll use a simple prompt
  const formats = ['PNG Image', 'PDF Report', 'CSV Data', 'JSON Data'];
  const choice = window.prompt(
    `Choose export format:\n${formats.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nEnter number (1-4):`
  );
  
  if (choice) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < formats.length) {
      const formatMap: ExportOptions['format'][] = ['png', 'pdf', 'csv', 'json'];
      onExport(formatMap[index]);
    }
  }
};