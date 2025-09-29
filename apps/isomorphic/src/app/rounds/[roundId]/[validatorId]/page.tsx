import { metaObject } from "@/config/site.config";
import Validator from "./validator";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  return <Validator />;
}
