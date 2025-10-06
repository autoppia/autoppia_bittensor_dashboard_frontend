import { metaObject } from "@/config/site.config";
import { redirect } from "next/navigation";

export const metadata = {
  ...metaObject(),
};

export default function Page() {
  redirect("/land");
}
