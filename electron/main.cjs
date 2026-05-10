const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const { setupDatabase, initSchema } = require('./db/schema.cjs');
const SecurityUtility = require('./security/fileEncryption.cjs');

const isDev = process.env.NODE_ENV !== 'production';

process.on('uncaughtException', (err) => {
  console.error('[Main Process] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true, // Temporarily enable for debugging
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  if (isDev) {
    // Wait 2 seconds for Vite to be fully ready
    setTimeout(() => {
      mainWindow.loadURL('http://127.0.0.1:5555');
      mainWindow.webContents.openDevTools();
    }, 2000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'dental_data.json');
  db = setupDatabase(dbPath);
  initSchema(db);

  // Seed initial data if empty
  if (db.data.patients.length === 0) {
    console.log('[DB] Seeding initial patient...');
    db.data.patients.push({
      id: '1',
      firstName: 'Shahin',
      lastName: 'Abbaszade',
      gender: 'M',
      dob: '1990-05-15',
      placeOfBirth: 'Tehran',
      codiceFiscale: 'BBS SHN 90E15 Z330V',
      profession: 'Ingegnere',
      phone: '+39 333 1234567',
      landline: '02 1234567',
      email: 'shahin@example.com',
      address: 'Via Roma 123',
      city: 'Roma',
      zipCode: '00118',
      province: 'RM',
      operator: 'STUDIORM',
      treatmentType: 'Ortodonzia',
      status: 'ACTIVE',
      startDate: '2024-03-11',
      lastVisit: '2024-03-11',
      allergies: 'Penicillina, Pollini',
      pathologies: 'Nessuna patologia cronica',
      medications: 'Nessuno',
      notes: 'Paziente collaborativo',
      odontogram: {},
      treatments: [
        { date: '2024-03-01', description: 'Pulizia denti (Igiene)', price: 80, operator: 'Dott. Rossi' },
        { date: '2024-03-05', description: 'Otturazione dente 18', tooth: '18', price: 120, operator: 'Dott. Rossi' }
      ],
      quotes: [],
      payments: []
    });
    db.save();
  }

  protocol.handle('secure-media', async (request) => {
    try {
      const url = request.url.replace('secure-media://', '');
      const filePath = decodeURIComponent(url);
      const buffer = await SecurityUtility.decryptFileToBuffer(filePath);
      let mimeType = 'image/jpeg';
      if (filePath.endsWith('.png')) mimeType = 'image/png';
      
      // Use net.fetch or Response if available, otherwise it might fail
      return new Response(buffer, {
        headers: { 'Content-Type': mimeType }
      });
    } catch (error) {
      console.error('Error loading secure media:', error);
      return new Response('Error', { status: 500 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS ---

ipcMain.handle('db:getPatients', async () => {
  return db.data.patients;
});

ipcMain.handle('db:getPatientById', async (event, id) => {
  const patient = db.data.patients.find(p => p.id === (id || '1')) || null;
  if (patient) {
    // Migration: ensure new fields exist for old records
    if (!patient.treatments) patient.treatments = [];
    if (!patient.quotes) patient.quotes = [];
    if (!patient.payments) patient.payments = [];
    if (!patient.odontogram) patient.odontogram = {};
  }
  return patient;
});

ipcMain.handle('db:getSettingsLists', async () => {
  // Full list of Rome CAPs from 00118 to 00199
  const romeCaps = [];
  for (let i = 118; i <= 199; i++) {
    romeCaps.push(`00${i}`);
  }
  
  return {
    treatmentTypes: ['Ortodonzia', 'Conservativa', 'Endodonzia', 'Chirurgia', 'Protesi', 'Igiene', 'Implantologia'],
    geography: {
      provinces: [
        { code: 'RM', name: 'Roma' },
        { code: 'MI', name: 'Milano' },
        { code: 'NA', name: 'Napoli' },
        { code: 'TO', name: 'Torino' },
        { code: 'FI', name: 'Firenze' }
      ],
      cities: {
        'RM': ['Roma', 'Guidonia Montecelio', 'Fiumicino', 'Pomezia', 'Anzio', 'Nettuno', 'Tivoli', 'Velletri', 'Civitavecchia'],
        'MI': ['Milano', 'Sesto San Giovanni', 'Cinisello Balsamo', 'Legnano', 'Rho', 'Cologno Monzese'],
        'NA': ['Napoli', 'Giugliano in Campania', 'Torre del Greco', 'Pozzuoli', 'Casoria'],
        'TO': ['Torino', 'Moncalieri', 'Rivoli', 'Collegno', 'Settimo Torinese'],
        'FI': ['Firenze', 'Scandicci', 'Sesto Fiorentino', 'Empoli', 'Campi Bisenzio']
      },
      zipCodes: {
        'Roma': romeCaps,
        'Milano': ['20121', '20122', '20123', '20124', '20125', '20126', '20127', '20128', '20129'],
        'Napoli': ['80121', '80122', '80123', '80124', '80125', '80126', '80127'],
        'Torino': ['10121', '10122', '10123', '10124', '10125', '10126', '10127'],
        'Firenze': ['50121', '50122', '50123', '50124', '50125', '50126', '50127'],
        'Guidonia Montecelio': ['00012'],
        'Fiumicino': ['00054'],
        'Pomezia': ['00040'],
        'Anzio': ['00042'],
        'Nettuno': ['00048'],
        'Tivoli': ['00019'],
        'Velletri': ['00049'],
        'Civitavecchia': ['00053'],
        'Sesto San Giovanni': ['20099'],
        'Rho': ['20017']
      }
    }
  };
});

ipcMain.handle('db:updatePatient', async (event, p) => {
  console.log(`[DB] Saving all data for patient ${p.id}...`);
  const index = db.data.patients.findIndex(item => item.id === p.id);
  if (index !== -1) {
    // We replace the whole object to ensure all new fields (quotes, payments, etc) are persisted
    db.data.patients[index] = { ...db.data.patients[index], ...p };
  } else {
    db.data.patients.push(p);
  }
  db.save();
  return { success: true };
});

ipcMain.handle('db:deletePatient', async (event, patientId) => {
  console.log(`[DB] Deleting patient ${patientId}...`);
  db.data.patients = db.data.patients.filter(p => p.id !== patientId);
  db.save();
  return { success: true };
});

ipcMain.handle('media:pickAndSave', async (event, patientId) => {
  const { dialog } = require('electron');
  const fs = require('fs');
  
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg'] },
      { name: 'Documents', extensions: ['pdf', 'doc', 'docx'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const sourcePath = result.filePaths[0];
  const ext = path.extname(sourcePath);
  const fileName = `${Date.now()}${ext}`;
  const storageDir = path.join(app.getPath('userData'), 'media', patientId);
  
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  
  const destPath = path.join(storageDir, fileName);
  await SecurityUtility.encryptFile(sourcePath, destPath);

  return {
    name: path.basename(sourcePath),
    path: destPath,
    type: ext.replace('.', '').toUpperCase(),
    date: new Date().toISOString().split('T')[0]
  };
});

ipcMain.handle('media:encryptAndSave', async (event, sourcePath, destPath) => {
  return await SecurityUtility.encryptFile(sourcePath, destPath);
});
