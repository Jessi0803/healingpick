import "dotenv/config";
import postgres from "postgres";

type UserRow = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  birthDate: string | null;
  birthTime: string | null;
  gender: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  credits: number;
  freeUsedToday: number;
  lastFreeReset: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

type MergePlan = {
  email: string;
  primary: UserRow;
  duplicates: UserRow[];
};

const APPLY = process.argv.includes("--apply");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL. Run this in an environment that can access production DB.");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  prepare: false,
  ssl: "require",
});

function isLineUser(user: UserRow) {
  return user.openId.startsWith("line:") || user.loginMethod === "line";
}

function sortUsersForPrimary(a: UserRow, b: UserRow) {
  const aLine = isLineUser(a);
  const bLine = isLineUser(b);
  if (aLine !== bLine) return aLine ? 1 : -1;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function latestDate(values: Date[]) {
  return values.reduce((latest, value) => (
    new Date(value).getTime() > new Date(latest).getTime() ? value : latest
  ), values[0]);
}

function printPlan(plan: MergePlan[]) {
  if (plan.length === 0) {
    console.log("No duplicate email users found.");
    return;
  }

  console.log(`${APPLY ? "Applying" : "Dry run"} merge for ${plan.length} duplicate email group(s):`);
  for (const item of plan) {
    const allUsers = [item.primary, ...item.duplicates];
    const totalCredits = allUsers.reduce((sum, user) => sum + user.credits, 0);
    console.log(`\n${item.email}`);
    console.log(`  keep #${item.primary.id} ${item.primary.openId} credits=${item.primary.credits}`);
    for (const duplicate of item.duplicates) {
      console.log(`  merge #${duplicate.id} ${duplicate.openId} credits=${duplicate.credits}`);
    }
    console.log(`  final credits=${totalCredits}`);
  }
}

async function getMergePlan(): Promise<MergePlan[]> {
  const rows = await sql<UserRow[]>`
    SELECT *
    FROM "users"
    WHERE "email" IS NOT NULL AND btrim("email") <> ''
    ORDER BY lower("email"), "createdAt", "id"
  `;

  const groups = new Map<string, UserRow[]>();
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email) continue;
    const group = groups.get(email) ?? [];
    group.push(row);
    groups.set(email, group);
  }

  const plan: MergePlan[] = [];
  for (const [email, users] of groups) {
    if (users.length < 2) continue;
    const sorted = [...users].sort(sortUsersForPrimary);
    const primary = sorted[0];
    const duplicates = sorted.slice(1);
    plan.push({ email, primary, duplicates });
  }

  return plan;
}

async function applyMerge(plan: MergePlan[]) {
  for (const item of plan) {
    await sql.begin(async (tx) => {
      const allUsers = [item.primary, ...item.duplicates];
      const duplicateIds = item.duplicates.map((user) => user.id);
      const totalCredits = allUsers.reduce((sum, user) => sum + user.credits, 0);
      const maxFreeUsedToday = Math.max(...allUsers.map((user) => user.freeUsedToday));
      const role = allUsers.some((user) => user.role === "admin") ? "admin" : item.primary.role;
      const lastFreeReset = latestDate(allUsers.map((user) => user.lastFreeReset));
      const lastSignedIn = latestDate(allUsers.map((user) => user.lastSignedIn));
      const updatedAt = new Date();
      const name = item.primary.name ?? item.duplicates.find((user) => user.name)?.name ?? null;
      const birthDate = item.primary.birthDate ?? item.duplicates.find((user) => user.birthDate)?.birthDate ?? null;
      const birthTime = item.primary.birthTime ?? item.duplicates.find((user) => user.birthTime)?.birthTime ?? null;
      const gender = item.primary.gender ?? item.duplicates.find((user) => user.gender)?.gender ?? null;

      await tx`
        UPDATE "readings"
        SET "userId" = ${item.primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "feedbacks"
        SET "userId" = ${item.primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "treehole_sessions"
        SET "userId" = ${item.primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "credit_transactions"
        SET "userId" = ${item.primary.id}
        WHERE "userId" = ANY(${duplicateIds})
      `;
      await tx`
        UPDATE "users"
        SET
          "name" = ${name},
          "email" = ${item.email},
          "birthDate" = ${birthDate},
          "birthTime" = ${birthTime},
          "gender" = ${gender},
          "role" = ${role},
          "credits" = ${totalCredits},
          "freeUsedToday" = ${maxFreeUsedToday},
          "lastFreeReset" = ${lastFreeReset},
          "lastSignedIn" = ${lastSignedIn},
          "updatedAt" = ${updatedAt}
        WHERE "id" = ${item.primary.id}
      `;
      await tx`
        DELETE FROM "users"
        WHERE "id" = ANY(${duplicateIds})
      `;
    });
    console.log(`Merged ${item.email} into user #${item.primary.id}`);
  }
}

try {
  const plan = await getMergePlan();
  printPlan(plan);
  if (APPLY && plan.length > 0) {
    await applyMerge(plan);
  }
} finally {
  await sql.end();
}
