import { getHomePreview } from "@/lib/home-preview";
import BookShell from "./BookShell";

export default function TapeHome() {
  return <BookShell home={getHomePreview()} />;
}
