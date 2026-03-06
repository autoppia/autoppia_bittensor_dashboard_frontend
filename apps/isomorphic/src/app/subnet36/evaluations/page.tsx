import { metaObject } from "@/config/site.config";
import TaskSearch from "../tasks/task-search";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <TaskSearch />;
}
