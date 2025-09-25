import { metaObject } from "@/config/site.config";
import Round from "./round";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <Round />;
}
