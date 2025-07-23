import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDayRangeEpoch(dateRange: Date[]) {
  if (!dateRange) {
    return [
      Math.trunc(new Date().setHours(0, 0, 0, 0) / 1000),
      Math.trunc(new Date().setHours(23, 59, 59, 59) / 1000),
    ];
  }

  const startDateEpoch = Math.trunc(dateRange[0].setHours(0, 0, 0, 0) / 1000);
  const endDateEpoch = Math.trunc(
    dateRange[1].setHours(23, 59, 59, 999) / 1000
  );
  return [startDateEpoch, endDateEpoch];
}

export const convertToMD5 = (input: string) => CryptoJS.MD5(input).toString();

export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function trimString(s: string, length: number) {
  if (!s) return;
  return s.length > length ? s.substring(0, length) + "..." : s;
}

export function checkIsIOSEnv() {
  return /iPhone|iPad|iPod|Mac OS X/.test(navigator.userAgent);
}

export const isNumber = (str) => {
  return !isNaN(str) && str.trim() !== "";
};

// Function to determine if a date should be disabled
export const disableFuture = (date) => {
  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Disable dates after today
  return date.getTime() > today.getTime();
};

// Function to validate CSV content
const validateCsvContent = (content) => {
  // Trim and split content into rows
  const rows = content.trim().split("\n");

  // Ensure there are multiple rows (header + data)
  if (rows.length < 2) {
    return `Invalid CSV file`;
  }

  // Detect the delimiter based on the header row
  const delimiters = [",", ";", "\t"];
  let detectedDelimiter = null;

  for (const delimiter of delimiters) {
    if (rows[0].includes(delimiter)) {
      detectedDelimiter = delimiter;
      break;
    }
  }

  if (!detectedDelimiter) {
    return `Invalid CSV file`;
  }

  // Check column consistency across rows
  const headerColumns = rows[0].split(detectedDelimiter).length;

  for (let i = 1; i < rows.length; i++) {
    const rowColumns = rows[i].split(detectedDelimiter).length;
    if (rowColumns !== headerColumns) {
      return `Invalid CSV file`;
    }
  }

  return null; // Valid CSV
};

export const validateCSV = (uploadedFile) => {
  return new Promise((resolve, reject) => {
    if (!uploadedFile) {
      return reject(new Error(`No file selected`));
    }

    const fileType = uploadedFile.type;
    const fileExtension = uploadedFile.name.split(".").pop().toLowerCase();

    // Validate MIME type and extension
    if (fileType !== "text/csv" && fileExtension !== "csv") {
      return reject(new Error("Invalid file type. Please upload a CSV file."));
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      // const content = e.target.result;

      // Run CSV content validation
      // const validationError = validateCsvContent(content);
      // if (validationError) {
      //   return reject(new Error(validationError));
      // }

      console.log("Valid CSV file");
      resolve();
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(uploadedFile);
  });
};
