"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Tasks() {
  const router = useRouter();
  useEffect(() => {
    router.push("/tasks/3413");
  }, [router]);

  return <></>;
}
