import "dotenv/config";
import postgres from "postgres";

const EMAILS = [
  "yunzhennn94@gmail.com",
  "yunyunyunyang0411@gmail.com",
  "yun435015@gmail.com",
];
const PRIMARY_EMAIL = EMAILS[0];
const APPLY = process.argv.includes("--apply");

type UserRow = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  birthDate: string | null;
  birthTime: string | null;
  gender: string | null;
  adminNote: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  credits: number;
  freeUsedToday: number;
  lastFreeReset: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL. Run this in an environment that can access production DB.");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  prepare: false,
  ssl: "require",
});

function normalized(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function latestDate(values: Date[]) {
  return values.reduce((latest, value) => (
    new Date(value).getTime() > new Date(latest).getTime() ? value : latest
  ), values[0]);
}

function pickPrimary(rows: UserRow[]) {
  const primaryEmailRow = rows.find((row) => normalized(row.email) === PRIMARY_EMAIL);
  if (primaryEmailRow) return primaryEmailRow;
  return [...rows].sort((a, b) => (
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id
  ))[0];
}

async function ensureAliasTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS "user_email_aliases" (
      "email" varchar(320) PRIMARY KEY NOT NULL,
      "userId" integer NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "user_email_aliases_userId_idx" ON "user_email_aliases" ("userId")
  `;
}

async function main() {
  await ensureAliasTable();

  const rows = await sql<UserRow[]>`
    SELECT *
    FROM "users"
    WHERE lower("email") = ANY(${EMAILS})
    ORDER BY "createdAt", "id"
  `;

  if (rows.length === 0) {
    console.log(`No existing users found for: ${EMAILS.join(", ")}`);
    console.log("Sign in once with the primary email first, then rerun this script.");
    return;
  }

  const primary = pickPrimary(rows);
  const duplicates = rows.filter((row) => row.id !== primary.id);
  const allUsers = [primary, ...duplicates];
  const duplicateIds = duplicates.map((user) => user.id);
  const totalCredits = allUsers.reduce((sum, user) => sum + user.credits, 0);
  const maxFreeUsedToday = Math.max(...allUsers.map((user) => user.freeUsedToday));
  const role = allUsers.some((user) => user.role === "admin") ? "admin" : primary.role;
  const lastFreeReset = latestDate(allUsers.map((user) => user.lastFreeReset));
  const lastSignedIn = latestDate(allUsers.map((user) => user.lastSignedIn));
  const name = primary.name ?? duplicates.find((user) => user.name)?.name ?? null;
  const birthDate = primary.birthDate ?? duplicates.find((user) => user.birthDate)?.birthDate ?? null;
  const birthTime = primary.birthTime ?? duplicates.find((user) => user.birthTime)?.birthTime ?? null;
  const gender = primary.gender ?? duplicates.find((user) => user.gender)?.gender ?? null;
  const adminNote = [primary.adminNote, ...duplicates.map((user) => user.adminNote)]
    .filter(Boolean)
    .join("\n\n")
    || null;

  console.log(`${APPLY ? "Applying" : "Dry run"} linked-account merge`);
  console.log(`  primary: #${primary.id} ${primary.email} (${primary.openId})`);
  for (const duplicate of duplicates) {
    console.log(`  merge:   #${duplicate.id} ${duplicate.email} (${duplicate.openId}) credits=${duplicate.credits}`);
  }
  console.log(`  aliases: ${EMAILS.join(", ")}`);
  console.log(`  final credits: ${totalCredits}`);
  console.log(`  final freeUsedToday: ${maxFreeUsedToday}`);

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to update the database.");
    return;
  }

  await sql.begin(async (tx) => {
    if (duplicateIds.length > 0) {
      await tx`
        UPDATE "readings"
        SET "userId" = ${primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "feedbacks"
        SET "userId" = ${primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "treehole_sessions"
        SET "userId" = ${primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "credit_transactions"
        SET "userId" = ${primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
    }

    await tx`
      UPDATE "users"
      SET
        "name" = ${name},
        "email" = ${PRIMARY_EMAIL},
        "birthDate" = ${birthDate},
        "birthTime" = ${birthTime},
        "gender" = ${gender},
        "adminNote" = ${adminNote},
        "role" = ${role},
        "credits" = ${totalCredits},
        "freeUsedToday" = ${maxFreeUsedToday},
        "lastFreeReset" = ${lastFreeReset},
        "lastSignedIn" = ${lastSignedIn},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${primary.id}
    `;

    for (const email of EMAILS) {
      await tx`
        INSERT INTO "user_email_aliases" ("email", "userId")
        VALUES (${email}, ${primary.id})
        ON CONFLICT ("email") DO UPDATE SET "userId" = EXCLUDED."userId"
      `;
    }

    if (duplicateIds.length > 0) {
      await tx`
        DELETE FROM "users"
        WHERE "id" = ANY(${duplicateIds})
      `;
    }
  });

  console.log(`Linked ${EMAILS.length} emails to user #${primary.id}`);
}

try {
  await main();
} finally {
  await sql.end();
}
