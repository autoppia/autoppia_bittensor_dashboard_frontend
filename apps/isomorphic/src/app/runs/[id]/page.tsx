import { metaObject } from "@/config/site.config";
import Runs from "./runs";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <Runs />;
}
