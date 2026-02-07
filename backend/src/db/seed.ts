import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { zones, users } from "./schema";
import { createLoginableUser, createMember } from "../lib/auth";
import { createAdminClient } from "../lib/supabase";

async function seed() {
  console.log("Seeding database...");

  // Seed zones
  await db
    .insert(zones)
    .values([
      { name: "Egbeda", abbreviation: "EGB" },
      { name: "Ikeja", abbreviation: "IKJ" },
      { name: "Surulere", abbreviation: "SRL" },
    ])
    .onConflictDoNothing();

  const zoneRows = await db.select({ id: zones.id, name: zones.name }).from(zones);
  console.log(`Zones available: ${zoneRows.length}`);

  const egbeda = zoneRows.find((z) => z.name === "Egbeda")?.id;
  const ikeja = zoneRows.find((z) => z.name === "Ikeja")?.id;

  // Seed admin user (Supabase Auth + public.users). Remove any existing row so we can re-seed with auth-backed admin.
  const adminEmail = "admin@church.org";
  await db.delete(users).where(eq(users.email, adminEmail));

  try {
    await createLoginableUser(adminEmail, "admin123456", "admin", {
      firstName: "System",
      lastName: "Admin",
      phoneNumber: "08000000000",
    });
    console.log("Seeded admin user (email: admin@church.org, password: admin123456)");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
      const supabase = createAdminClient();
      const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUser = data.users.find((u) => u.email === adminEmail);
      if (authUser) {
        await db.insert(users).values({
          id: authUser.id,
          email: adminEmail,
          phoneNumber: "08000000000",
          firstName: "System",
          lastName: "Admin",
          role: "admin",
          status: "active",
        });
        console.log("Linked existing Auth admin to public.users.");
      } else {
        console.log("Admin already exists in Auth but could not link; delete the auth user and re-run seed if needed.");
      }
    } else {
      throw err;
    }
  }

  // Seed sample members (no login)
  const existingMembers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "member"));

  if (existingMembers.length === 0 && egbeda && ikeja) {
    await createMember({
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "08011111111",
      zoneId: egbeda,
    });
    await createMember({
      firstName: "Jane",
      lastName: "Smith",
      phoneNumber: "08022222222",
      zoneId: egbeda,
    });
    await createMember({
      firstName: "Chidi",
      lastName: "Okeke",
      phoneNumber: "08033333333",
      zoneId: ikeja,
    });
    console.log("Seeded 3 sample members.");
  } else {
    console.log("Members already exist or zones missing, skipping member seed.");
  }

  console.log("Seeding completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
