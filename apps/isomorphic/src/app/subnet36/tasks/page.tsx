import { metaObject } from "@/config/site.config";
import TaskSearch from "./task-search";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <TaskSearch />;
}
