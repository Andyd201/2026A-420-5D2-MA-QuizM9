/**
<<<<<<< HEAD
 * La connexion à la base. Un seul fichier SQLite, server/data/quizm9.db par
 * défaut ; la variable d'environnement DB_PATH permet de le placer ailleurs
 * (dans un conteneur, sur un volume : semaine 3).
 *
 * Le fichier n'est pas versionné : chacun a le sien, régénéré au besoin.
 * Pour repartir à neuf : arrêtez le serveur et supprimez le fichier.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = new URL('../../data/', import.meta.url);
const dbPath = process.env.DB_PATH ?? fileURLToPath(new URL('quizm9.db', dataDir));

mkdirSync(dirname(dbPath), { recursive: true });
export const db = new DatabaseSync(dbPath);

// Les lecteurs (le harnais, un autre processus) ne bloquent pas le serveur.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/** Crée les tables (schema.sql), puis les remplit (seed.sql) si la base est vide. */
export function initializeDatabase() {
  const schemaPath = new URL('schema.sql', dataDir);
  const schemaSql = readFileSync(fileURLToPath(schemaPath), 'utf8');
  db.exec(schemaSql);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM quiz').get();
  if (count === 0) {
    const seedPath = new URL('seed.sql', dataDir);
    const seedSql = readFileSync(fileURLToPath(seedPath), 'utf8');
    db.exec(seedSql);
    console.log('Database initialized with seed data.');
  }
}

/**
 * Enveloppe des écritures qui doivent réussir ENSEMBLE. Si fn lève une
 * erreur, tout est annulé (ROLLBACK) ; sinon tout est confirmé (COMMIT).
 */
export function withTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
=======
 * L'aiguilleur vers le moteur de base de données. DATABASE_URL décide :
 *
 *   postgres://…   PostgreSQL, le moteur du cours (db-postgres.js). C'est le
 *                  défaut : le service postgres de compose.yml.
 *   sqlite:…       SQLite, un simple fichier, pour un poste SANS Docker
 *                  (db-sqlite.js). Rien à installer : il est dans Node.
 *
 * Les deux modules offrent la même interface : `pool.query(sql, [valeurs])`
 * qui retourne { rows, rowCount }, et `pool.connect()` pour une transaction.
 * Le reste de repository/ ne sait pas lequel des deux répond.
 */
const engine = process.env.DATABASE_URL?.startsWith('sqlite:')
  ? await import('./db-sqlite.js')
  : await import('./db-postgres.js');

export const { pool, initializeDatabase, closeDatabase } = engine;

/**
 * Enveloppe des écritures qui doivent réussir ENSEMBLE. Une transaction vit
 * sur UNE connexion : on en emprunte une au pool et on la passe à fn, qui
 * doit s'en servir pour chaque requête. Si fn lève une erreur, tout est
 * annulé (ROLLBACK) ; sinon tout est confirmé (COMMIT).
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
>>>>>>> upstream/main
  }
}
