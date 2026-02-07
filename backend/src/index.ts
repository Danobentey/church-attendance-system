import "dotenv/config";

console.log("Church Attendance System — Backend");
console.log("==================================");
console.log("Environment:", process.env.NODE_ENV ?? "development");
console.log("");
console.log("Available scripts:");
console.log("  npm run db:generate  — Generate migration files from schema changes");
console.log("  npm run db:migrate   — Run pending migrations against Supabase");
console.log("  npm run db:push      — Push schema directly (development only)");
console.log("  npm run db:studio    — Open Drizzle Studio to browse data");
console.log("  npm run db:seed      — Seed the database with sample data");
