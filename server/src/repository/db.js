/**
 * La connexion à la base. PostgreSQL est un SERVEUR, plus un fichier : on
 * s'y connecte par une adresse, DATABASE_URL. La valeur par défaut est celle
 * du service postgres de compose.yml, démarré par `docker compose up -d postgres`.
 *
 * Un Pool garde quelques connexions ouvertes et en prête une à chaque
 * requête. Toute requête est ASYNCHRONE : elle part sur le réseau, la
 * réponse revient plus tard, d'où les `await` partout dans repository/.
 */
import pg from 'pg';

const { Pool, types } = pg;

// Les BIGINT (horodatages, COUNT(*)) arrivent en chaîne par défaut, parce
// qu'un BIGINT peut dépasser ce qu'un Number représente. Pas les nôtres :
// on les convertit en nombres.
types.setTypeParser(types.builtins.INT8, Number);

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://quizm9:quizm9@localhost:5432/quizm9';

export const pool = new Pool({ connectionString: DATABASE_URL });

/** Crée les tables (schema.sql), puis les remplit (seed.sql) si la base est vide. */
export async function initializeDatabase() {
  const schema = await readSql('schema.sql');
  await pool.query(schema);

  const { rows } = await pool.query('SELECT COUNT(*) AS n FROM quiz');
  if (rows[0].n === 0) {
    await pool.query(await readSql('seed.sql'));
  }
}

async function readSql(name) {
  const { readFile } = await import('node:fs/promises');
  return readFile(new URL(`../../data/${name}`, import.meta.url), 'utf8');
}

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
  }
}

/** Ferme les connexions ; les tests s'en servent pour finir proprement. */
export function closeDatabase() {
  return pool.end();
}
