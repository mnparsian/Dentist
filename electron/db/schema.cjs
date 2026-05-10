// This file simulates the DB setup. In a real environment, you'd use `better-sqlite3` compiled with SQLCipher.
const fs = require('fs');
const path = require('path');

const setupDatabase = (dbPath, key) => {
  // Simulating connection to better-sqlite3 with sqlcipher
  console.log(`[DB] Connecting to ${dbPath} with encryption key...`);
  
  // Here you would do:
  // const Database = require('better-sqlite3');
  // const db = new Database(dbPath);
  // db.pragma(`key='${key}'`);
  
  return {
    exec: (sql) => console.log(`[DB] Executing schema:\n${sql}`),
    prepare: (sql) => ({ run: () => {}, get: () => {}, all: () => [] })
  };
};

const initSchema = (db) => {
  const schema = `
    CREATE TABLE IF NOT EXISTS Patients (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        dob DATE,
        phone TEXT,
        email TEXT,
        partitaIva TEXT,
        codiceFiscale TEXT,
        codiceSts TEXT,
        anamnesis TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS TreatmentsList (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        defaultPrice REAL NOT NULL,
        category TEXT
    );

    CREATE TABLE IF NOT EXISTS ClinicalHistory (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        treatmentId TEXT NOT NULL,
        toothNumber INTEGER,
        surfaces TEXT, 
        notes TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES Patients(id),
        FOREIGN KEY (treatmentId) REFERENCES TreatmentsList(id)
    );

    CREATE TABLE IF NOT EXISTS Financials (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        clinicalHistoryId TEXT,
        totalAmount REAL NOT NULL,
        paidAmount REAL DEFAULT 0,
        dueDate DATE,
        status TEXT DEFAULT 'PENDING',
        FOREIGN KEY (patientId) REFERENCES Patients(id)
    );
  `;
  
  db.exec(schema);
  console.log('[DB] Schema initialized successfully.');
};

module.exports = {
  setupDatabase,
  initSchema
};
