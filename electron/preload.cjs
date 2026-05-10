const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Database Operations
    getPatients: () => ipcRenderer.invoke('db:getPatients'),
    
    // Security / Media
    encryptAndSaveMedia: (sourcePath, destPath) => ipcRenderer.invoke('media:encryptAndSave', sourcePath, destPath),
    
    // Helper to get the custom protocol URL for an encrypted image
    getSecureMediaUrl: (encryptedFilePath) => `secure-media://${encodeURIComponent(encryptedFilePath)}`
  }
);
