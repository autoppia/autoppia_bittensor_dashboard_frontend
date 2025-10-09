import { metaObject } from "@/config/site.config";
import Task from "./task";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <Task />;
}
