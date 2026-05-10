const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { setupDatabase, initSchema } = require('./db/schema.cjs');
const SecurityUtility = require('./security/fileEncryption.cjs');

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
    },
  });

  if (isDev) {
    // Vite is currently running on port 5174
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // Initialize Database
  const dbPath = path.join(app.getPath('userData'), 'dental_data.sqlite');
  const dbKey = 'super_secret_encryption_key_for_sqlcipher'; // Should be user-provided or secure enclave
  const db = setupDatabase(dbPath, dbKey);
  initSchema(db);

  // Register custom protocol to serve decrypted media
  protocol.registerBufferProtocol('secure-media', async (request, callback) => {
    try {
      const url = request.url.replace('secure-media://', '');
      const filePath = decodeURIComponent(url);
      
      // Decrypt on the fly
      const buffer = await SecurityUtility.decryptFileToBuffer(filePath);
      
      // Determine mime type (simplified)
      let mimeType = 'image/jpeg';
      if (filePath.endsWith('.png')) mimeType = 'image/png';
      
      callback({ mimeType, data: buffer });
    } catch (error) {
      console.error('Error loading secure media:', error);
      callback({ error: -2 }); // net::ERR_FAILED
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for React to talk to SQLite/Security
ipcMain.handle('db:getPatients', async () => {
  return [{ id: '1', firstName: 'Mario', lastName: 'Rossi', phone: '12345' }];
});

ipcMain.handle('media:encryptAndSave', async (event, sourcePath, destPath) => {
  return await SecurityUtility.encryptFile(sourcePath, destPath);
});
