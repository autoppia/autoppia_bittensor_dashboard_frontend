import { metaObject } from "@/config/site.config";
import Agent from "./agent";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <Agent />;
}
