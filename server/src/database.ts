import initSqlJs, { Database } from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database.db');

let db: Database | null = null;

/**
 * Spara databasen till fil
 * Eftersom sql.js körs i RAM måste vi skriva ner den till disk manuellt
 */
export const saveDatabase = (): void => {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('❌ Fel vid sparning av databas:', error);
  }
};

/**
 * Initiera databasen
 */
const initDatabase = async (): Promise<void> => {
  const require = createRequire(import.meta.url);
  const sqlJsPath = require.resolve('sql.js');
  const sqlJsDir = dirname(sqlJsPath);
  
  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      return join(sqlJsDir, file);
    }
  });

  if (existsSync(dbPath)) {
    try {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✓ Laddade befintlig databas');
    } catch (error) {
      console.log('⚠️  Kunde inte ladda databas, skapar ny...');
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('✓ Skapade ny databas');
  }

  db.run('PRAGMA foreign_keys = ON');

  const createMoviesTable = `
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      poster_path TEXT,
      release_date TEXT,
      vote_average REAL,
      overview TEXT,
      status TEXT NOT NULL CHECK(status IN ('watchlist', 'watched')),
      personal_rating INTEGER CHECK(personal_rating BETWEEN 1 AND 5),
      review TEXT,
      is_favorite INTEGER DEFAULT 0,
      date_added TEXT DEFAULT (datetime('now')),
      date_watched TEXT,
      UNIQUE(tmdb_id)
    )
  `;

  db.run(createMoviesTable);
  saveDatabase();
  console.log('✓ Databastabeller initierade');

  // Valfritt: Auto-save var 60:e sekund som säkerhet
  setInterval(saveDatabase, 60000);
};

// Starta initieringen direkt
await initDatabase();

/**
 * Wrapper-funktion för att komma åt databas-instansen
 * Det är denna som anropas via db() i din router
 */
export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Databasen är inte initierad än!');
  }
  return db;
};

// Default export så att "import db from './database.js'" fungerar
export default getDatabase;