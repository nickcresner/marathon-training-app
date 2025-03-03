// src/utils/csvParser.js

/**
 * Utility to parse and normalize Google Sheet CSV data to ensure it matches the expected format
 */

import Papa from 'papaparse';

/**
 * Parse CSV data and convert to standard format, handling various spreadsheet layouts
 * @param {string} csvData - The raw CSV data from Google Sheets
 * @return {Array} - Normalized rows that can be processed by workouts.js
 */
export function parseAndNormalizeCSV(csvData) {
  // Parse the CSV data
  const parseResult = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    error: (error) => {
      console.error("CSV parsing error:", error);
    }
  });
  
  if (!parseResult.data || parseResult.data.length === 0) {
    console.error("No data found in CSV");
    return [];
  }
  
  // Get column headers from the first row
  const firstRow = parseResult.data[0];
  const headers = Object.keys(firstRow);
  
  // Detect spreadsheet format and normalize
  const format = detectSpreadsheetFormat(headers);
  console.log("Detected spreadsheet format:", format);
  
  // Normalize the data based on the detected format
  const normalizedData = normalizeData(parseResult.data, format);
  
  return normalizedData;
}

/**
 * Detect the format of the spreadsheet based on headers
 * @param {Array} headers - Column headers from the spreadsheet
 * @return {string} - Format identifier ('standard', 'lettered', 'custom', etc.)
 */
function detectSpreadsheetFormat(headers) {
  // Check for standard format with named columns
  if (headers.includes('Name') && headers.includes('Sets') && headers.includes('Reps')) {
    return 'standard';
  }
  
  // Check for lettered columns (A, B, C, etc.)
  const letteredColumns = headers.filter(h => /^[A-Z]$/.test(h));
  if (letteredColumns.length >= 5) {
    return 'lettered';
  }
  
  // Check for numbered columns
  const numberedColumns = headers.filter(h => /^\d+$/.test(h));
  if (numberedColumns.length > 0) {
    return 'numbered';
  }
  
  // Default format
  return 'custom';
}

/**
 * Normalize data based on detected format
 * @param {Array} data - The parsed CSV data
 * @param {string} format - The detected format
 * @return {Array} - Normalized data
 */
function normalizeData(data, format) {
  // If it's already in our standard format, return as is
  if (format === 'standard') {
    return data;
  }
  
  // For lettered columns (A, B, C, etc.)
  if (format === 'lettered') {
    return data.map(row => {
      // Try to extract exercise names and details from lettered columns
      return {
        A: row.A || '',          // Usually exercise code (A1, B1, etc.)
        B: row.B || '',          // Usually exercise name
        C: row.C || '',          // Usually sets
        D: row.D || '',          // Usually reps
        E: row.E || '',          // Usually tempo
        F: row.F || '',          // Usually load
        G: row.G || '',          // Usually rest
        H: row.H || '',          // Usually duration
        I: row.I || '',          // Usually notes
        ...row                   // Keep other columns for history data
      };
    });
  }
  
  // For custom formats, try to map to our expected format
  return data.map(row => {
    const normalizedRow = { ...row };
    
    // Try to identify and map key columns
    const headers = Object.keys(row);
    
    // Look for exercise name column
    const nameColumn = headers.find(h => 
      h.toLowerCase().includes('exercise') || 
      h.toLowerCase().includes('name') ||
      h.toLowerCase().includes('movement')
    );
    
    if (nameColumn) {
      normalizedRow.B = row[nameColumn];
    }
    
    // Look for sets column
    const setsColumn = headers.find(h => h.toLowerCase().includes('set'));
    if (setsColumn) {
      normalizedRow.C = row[setsColumn];
    }
    
    // Look for reps column
    const repsColumn = headers.find(h => 
      h.toLowerCase().includes('rep') || 
      h.toLowerCase().includes('count')
    );
    if (repsColumn) {
      normalizedRow.D = row[repsColumn];
    }
    
    // Look for tempo column
    const tempoColumn = headers.find(h => h.toLowerCase().includes('tempo'));
    if (tempoColumn) {
      normalizedRow.E = row[tempoColumn];
    }
    
    // Look for load column
    const loadColumn = headers.find(h => 
      h.toLowerCase().includes('load') || 
      h.toLowerCase().includes('weight') ||
      h.toLowerCase().includes('kg')
    );
    if (loadColumn) {
      normalizedRow.F = row[loadColumn];
    }
    
    // Look for rest column
    const restColumn = headers.find(h => h.toLowerCase().includes('rest'));
    if (restColumn) {
      normalizedRow.G = row[restColumn];
    }
    
    // Look for notes column
    const notesColumn = headers.find(h => h.toLowerCase().includes('note'));
    if (notesColumn) {
      normalizedRow.I = row[notesColumn];
    }
    
    return normalizedRow;
  });
}

/**
 * Extract history data from the spreadsheet
 * @param {Array} data - The normalized data
 * @return {Object} - Mapping of exercise IDs to history entries
 */
export function extractHistoryData(data) {
  const history = {};
  
  // Find date columns (columns that can be parsed as dates)
  const dateColumns = [];
  
  if (data.length === 0) return history;
  
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  headers.forEach(header => {
    // Skip standard exercise detail columns
    if (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].includes(header)) {
      return;
    }
    
    // Check if the header is a date
    const possibleDate = parseDate(header);
    if (possibleDate) {
      dateColumns.push({
        column: header,
        date: possibleDate
      });
    }
  });
  
  // Sort date columns chronologically
  dateColumns.sort((a, b) => a.date - b.date);
  
  // Process each row to extract history data
  data.forEach((row, rowIndex) => {
    // Skip rows that don't contain exercise data
    if (!row.A || !row.B || (!row.A.match(/^[A-Z]\d+$/) && !row.B.match(/^[A-Z]\d+$/))) {
      return;
    }
    
    // Generate a unique ID for this exercise 
    // In a real app, you'd need a more robust ID generation strategy
    const exerciseId = `exercise-${rowIndex}`;
    
    const historyEntries = [];
    
    // Extract data from each date column
    dateColumns.forEach(dateCol => {
      const value = row[dateCol.column];
      if (value && value.trim() !== '') {
        historyEntries.push({
          date: dateCol.date.toISOString().split('T')[0],
          value: value
        });
      }
    });
    
    if (historyEntries.length > 0) {
      history[exerciseId] = historyEntries;
    }
  });
  
  return history;
}

/**
 * Try to parse a string as a date
 * @param {string} dateStr - String that might be a date
 * @return {Date|null} - Date object or null if parsing failed
 */
function parseDate(dateStr) {
  // Skip empty strings
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Try various date formats
  const formats = [
    // DD/MM/YY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      parse: (match) => new Date(`20${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`)
    },
    // DD/MM/YYYY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      parse: (match) => new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`)
    },
    // MM/DD/YY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      parse: (match) => new Date(`20${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`)
    },
    // MM/DD/YYYY
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      parse: (match) => new Date(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`)
    },
    // YYYY-MM-DD
    {
      regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      parse: (match) => new Date(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`)
    }
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format.regex);
    if (match) {
      try {
        const date = format.parse(match);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        // Parse error, try next format
      }
    }
  }
  
  return null;
}