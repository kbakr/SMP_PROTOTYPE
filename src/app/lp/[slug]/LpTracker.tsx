"use client";

import { useEffect } from "react";

export function LpTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const customer = JSON.parse(window.localStorage.getItem("smp-customer") || "null");
    void fetch("/api/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, customerId: customer?.id }),
    });
  }, [slug]);
  return null;
}
