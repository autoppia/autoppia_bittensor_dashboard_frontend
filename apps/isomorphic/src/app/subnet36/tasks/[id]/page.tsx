import { metaObject } from "@/config/site.config";
import TaskDynamic from "./task-dynamic";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <TaskDynamic />;
}
