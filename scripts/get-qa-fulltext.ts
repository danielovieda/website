import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error('usage: pnpm tsx scripts/get-qa-fulltext.ts <id-prefix> [more...]');
    process.exit(1);
  }
  for (const idp of ids) {
    const r = await pool.query(
      'SELECT id, question, answer FROM qa_pairs WHERE id::text LIKE $1 LIMIT 1',
      [`${idp}%`],
    );
    if (r.rows[0]) {
      console.log('--- [' + idp + '] ---');
      console.log('Q:', r.rows[0].question);
      console.log('A:', r.rows[0].answer);
      console.log();
    }
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
