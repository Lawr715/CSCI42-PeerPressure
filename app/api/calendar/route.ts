import { getCalendarEvents } from "@/app/actions/calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getCalendarEvents();
  return Response.json(events);
}