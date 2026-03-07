import { getProfile } from "@/app/lib/auth";
import { getFollowUpList } from "@/app/lib/follow-ups";
import FollowUpListContent from "./_components/FollowUpListContent";

type Props = {
  searchParams: Promise<{ category?: string; search?: string }>;
};

export default async function FollowUpsPage({ searchParams }: Props) {
  const params = await searchParams;
  const profile = await getProfile();
  const category =
    params.category === "first_timers" || params.category === "absent"
      ? params.category
      : undefined;
  const search = params.search ?? undefined;

  const items = profile ? await getFollowUpList(profile, { category, search }) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Follow-up List</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ensure no one falls through the cracks.
        </p>
      </div>

      <FollowUpListContent initialItems={items} />
    </div>
  );
}
