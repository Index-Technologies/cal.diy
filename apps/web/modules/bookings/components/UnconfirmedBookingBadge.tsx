"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Badge } from "@calcom/ui/components/badge";

export default function UnconfirmedBookingBadge() {
  const { t } = useLocale();
  const { data: unconfirmedBookingCount } = trpc.viewer.me.bookingUnconfirmedCount.useQuery();
  if (!unconfirmedBookingCount) return null;
  // Rendered inside the Bookings nav item's <Link>, so this badge cannot
  // itself be an anchor — nested <a> tags trip a fatal hydration error in
  // React 19 and silently leave the page un-hydrated. The parent <Link>
  // already navigates to /bookings/upcoming on click.
  return (
    <Badge rounded title={t("unconfirmed_bookings_tooltip")} variant="orange">
      {unconfirmedBookingCount}
    </Badge>
  );
}
