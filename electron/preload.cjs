const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Database Operations
    getPatients: () => ipcRenderer.invoke('db:getPatients'),
    getPatientById: (id) => ipcRenderer.invoke('db:getPatientById', id),
    getSettingsLists: () => ipcRenderer.invoke('db:getSettingsLists'),
    updatePatient: (data) => ipcRenderer.invoke('db:updatePatient', data),
    deletePatient: (id) => ipcRenderer.invoke('db:deletePatient', id),
    
    // Security / Media
    encryptAndSaveMedia: (sourcePath, destPath) => ipcRenderer.invoke('media:encryptAndSave', sourcePath, destPath),
    pickAndSaveMedia: (patientId) => ipcRenderer.invoke('media:pickAndSave', patientId),
    
    // Helper to get the custom protocol URL for an encrypted image
    getSecureMediaUrl: (encryptedFilePath) => `secure-media://${encodeURIComponent(encryptedFilePath)}`
  }
);
