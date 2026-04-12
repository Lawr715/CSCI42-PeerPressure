import { getCalendarEvents } from "@/app/actions/calendar";

export async function GET() {
  const events = await getCalendarEvents();
  return Response.json(events);
}