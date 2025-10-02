import { metaObject } from "@/config/site.config";
import Tasks from "./tasks";

export const metadata = {
  ...metaObject(),
};

export default function FileListPage() {
  return <Tasks />;
}
