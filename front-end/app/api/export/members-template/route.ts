import { getProfile } from "@/app/lib/auth";

export async function GET() {
  await getProfile();
  const header =
    "first_name,last_name,phone_number,email,zone_name\n";
  return new Response(header, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="members-import-template.csv"',
    },
  });
}
