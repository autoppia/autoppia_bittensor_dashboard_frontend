import { metaObject } from "@/config/site.config";
import Agents from "./agents";

export const metadata = {
  ...metaObject(),
};

export default function FileListPage() {
  return <Agents />;
}
