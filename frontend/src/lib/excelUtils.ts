import * as XLSX from 'xlsx';
import { QuizQuestion } from './db';

export function downloadAssessmentTemplate() {
  const headers = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
  const sampleRows = [
    ['What is HTML?', 'Programming Language', 'Markup Language', 'Database', 'Operating System', 'B'],
    ['What is CSS?', 'Styling Language', 'Database', 'Operating System', 'Compiler', 'A'],
  ];

  const worksheetData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better user experience
  worksheet['!cols'] = [
    { wch: 35 }, // Question
    { wch: 25 }, // Option A
    { wch: 25 }, // Option B
    { wch: 25 }, // Option C
    { wch: 25 }, // Option D
    { wch: 15 }, // Correct Answer
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assessment Questions');

  XLSX.writeFile(workbook, 'Assessment_Questions_Template.xlsx');
}

function parseWorkbookData(data: Uint8Array): { questions: QuizQuestion[]; errors: string[] } {
  const workbook = XLSX.read(data, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { questions: [], errors: ['Excel file has no readable sheet.'] };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Read sheet as array of arrays (rows)
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rows.length <= 1) {
    return { questions: [], errors: ['Excel file is empty or missing data rows.'] };
  }

  const questions: QuizQuestion[] = [];
  const errors: string[] = [];

  // Skip header (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1; // 1-indexed Excel row number

    // Check if row is entirely empty
    const isRowEmpty = !row || row.every((cell: any) => String(cell).trim() === '');
    if (isRowEmpty) continue;

    const questionText = String(row[0] || '').trim();
    const optionA = String(row[1] || '').trim();
    const optionB = String(row[2] || '').trim();
    const optionC = String(row[3] || '').trim();
    const optionD = String(row[4] || '').trim();
    const rawAnswer = String(row[5] || '').trim().toUpperCase();

    // Validate row data
    if (!questionText) {
      errors.push(`Row ${rowNum}: Question text cannot be empty.`);
      continue;
    }

    if (!optionA) {
      errors.push(`Row ${rowNum}: Option A cannot be empty.`);
      continue;
    }
    if (!optionB) {
      errors.push(`Row ${rowNum}: Option B cannot be empty.`);
      continue;
    }
    if (!optionC) {
      errors.push(`Row ${rowNum}: Option C cannot be empty.`);
      continue;
    }
    if (!optionD) {
      errors.push(`Row ${rowNum}: Option D cannot be empty.`);
      continue;
    }

    if (!rawAnswer) {
      errors.push(`Row ${rowNum}: Correct Answer cannot be empty.`);
      continue;
    }

    if (!['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      errors.push(`Row ${rowNum}: Correct Answer must be A, B, C, or D.`);
      continue;
    }

    questions.push({
      id: `q_${Date.now()}_${i}`,
      question: questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer: rawAnswer as 'A' | 'B' | 'C' | 'D',
    });
  }

  return { questions, errors };
}

export async function parseAssessmentExcel(file: any): Promise<{ questions: QuizQuestion[]; errors: string[] }> {
  if (file instanceof Uint8Array) {
    return parseWorkbookData(file);
  }
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(file)) {
    return parseWorkbookData(new Uint8Array(file));
  }
  if (file instanceof ArrayBuffer) {
    return parseWorkbookData(new Uint8Array(file));
  }
  if (file && typeof file.arrayBuffer === 'function') {
    const arrayBuf = await file.arrayBuffer();
    return parseWorkbookData(new Uint8Array(arrayBuf));
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          resolve(parseWorkbookData(data));
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  throw new Error('Unsupported input format for Excel parsing');
}
