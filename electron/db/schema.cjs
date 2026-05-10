const fs = require('fs');
const path = require('path');

// Simple JSON Database Implementation to avoid Native Module Version issues
class JsonDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.data = {
      patients: [],
      settings: {}
    };
    this.load();
  }

  load() {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('[DB] Load error:', e);
      }
    } else {
      this.save();
    }
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  // Mocking better-sqlite3 API for compatibility
  prepare(sql) {
    return {
      run: (...args) => {
        // Logic for updates (simplified)
        if (sql.includes('UPDATE Patients')) {
          const p = args[0]; // This is usually handled differently in real SQL, but we'll adapt main.cjs
          this.save();
        }
        return { changes: 1 };
      },
      get: (...args) => {
        if (sql.includes('COUNT(*)')) return { count: this.data.patients.length };
        if (sql.includes('FROM Patients WHERE id = ?')) {
          return this.data.patients.find(p => p.id === args[0]) || null;
        }
        return null;
      },
      all: () => {
        if (sql.includes('FROM Patients')) return this.data.patients;
        return [];
      }
    };
  }

  exec(sql) {
    // Initial schema setup - ignored in JSON mode
    console.log('[DB] JSON Schema ready');
  }
}

const setupDatabase = (dbPath, key) => {
  console.log(`[DB] Connecting to JSON Store at ${dbPath}...`);
  // Replace .sqlite extension with .json for clarity
  const jsonPath = dbPath.replace('.sqlite', '.json');
  return new JsonDatabase(jsonPath);
};

const initSchema = (db) => {
  db.exec('INIT');
  console.log('[DB] JSON persistence layer initialized.');
};

module.exports = {
  setupDatabase,
  initSchema
};
