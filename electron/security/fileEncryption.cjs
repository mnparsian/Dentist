const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.randomBytes(32); // In production, this should be derived securely (e.g., PBKDF2) from a user password or OS Keychain
const IV_LENGTH = 16;

const SecurityUtility = {
  /**
   * Encrypts a file from source to destination
   * @param {string} sourcePath Path to the unencrypted file
   * @param {string} destPath Path to save the encrypted file
   * @returns {Promise<void>}
   */
  encryptFile: (sourcePath, destPath) => {
    return new Promise((resolve, reject) => {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
      const input = fs.createReadStream(sourcePath);
      const output = fs.createWriteStream(destPath);

      // Prepend IV to the encrypted file
      output.write(iv);
      
      input.pipe(cipher).pipe(output)
        .on('finish', () => resolve(destPath))
        .on('error', reject);
    });
  },

  /**
   * Decrypts a file directly into a Buffer so it can be served via a custom protocol
   * or sent via IPC without writing the unencrypted file to disk.
   * @param {string} encryptedFilePath 
   * @returns {Promise<Buffer>}
   */
  decryptFileToBuffer: (encryptedFilePath) => {
    return new Promise((resolve, reject) => {
      try {
        const encryptedData = fs.readFileSync(encryptedFilePath);
        
        // Extract IV from the first 16 bytes
        const iv = encryptedData.slice(0, IV_LENGTH);
        const content = encryptedData.slice(IV_LENGTH);
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        
        let decrypted = decipher.update(content);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        resolve(decrypted);
      } catch (err) {
        reject(err);
      }
    });
  }
};

module.exports = SecurityUtility;
