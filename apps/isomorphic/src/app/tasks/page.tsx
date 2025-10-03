import { metaObject } from "@/config/site.config";
import Tasks from "./tasks";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <Tasks />;
}
