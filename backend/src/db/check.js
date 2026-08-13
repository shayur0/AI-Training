import { pool, query } from "./client.js";

async function main() {
  const tables = await query(
    `select table_name from information_schema.tables
     where table_schema = 'public' order by table_name`
  );
  console.log("Connected. Tables:", tables.rows.map((r) => r.table_name).join(", "));

  const { rows: [user] } = await query(
    `insert into users (name, role, age_band) values ($1, $2, $3) returning id, name, role, age_band, created_at`,
    ["Ada", "child", "8-9"]
  );
  console.log("Inserted user:", user);

  const { rows: [worksheet] } = await query(
    `insert into worksheets (user_id, topic, subject) values ($1, $2, $3) returning id, topic, subject, created_at`,
    [user.id, "FIFA World Cup", "math"]
  );
  console.log("Inserted linked worksheet:", worksheet);

  const { rows: joined } = await query(
    `select u.name, u.role, w.topic, w.subject, w.created_at
     from worksheets w
     join users u on u.id = w.user_id
     where w.id = $1`,
    [worksheet.id]
  );
  console.log("Read back with join:", joined[0]);

  await pool.end();
}

main().catch((err) => {
  console.error("db:check failed:", err.message);
  process.exit(1);
});
