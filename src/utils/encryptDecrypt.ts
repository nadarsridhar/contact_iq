import CryptoJS from "crypto-js";
const SECRET_KEY = "skey-2324";

// SYMMETRIC ENCRYPTION as discussed

// Encrypt data (handles complex objects)
export const encryptData = (data) => {
  try {
    const jsonData = JSON.stringify(data); // Convert object to string
    return CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// Decrypt data (handles complex objects)
export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); // Convert string back to object
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
