import { getCheckInMembers, getCheckInGuests } from "@/app/lib/check-in";
import CheckInContent from "./_components/CheckInContent";

export default async function CheckInPage() {
  const [initialMembers, initialGuests] = await Promise.all([
    getCheckInMembers(),
    getCheckInGuests(),
  ]);

  return (
    <CheckInContent
      initialMembers={initialMembers}
      initialGuests={initialGuests}
    />
  );
}
