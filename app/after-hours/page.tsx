import type { Metadata } from "next";
import { AfterHoursGame } from "@/components/minigame/AfterHoursGame";

export const metadata: Metadata = {
  title: "After Hours",
  description:
    "Hide pixel Lawyered in a dark office and survive the client's glare for thirty seconds.",
};

export default function AfterHoursPage() {
  return <AfterHoursGame />;
}
