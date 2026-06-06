"use client";

import dynamic from "next/dynamic";

const EloHistoryChart = dynamic(
  () => import("./EloHistoryChart").then((m) => m.EloHistoryChart),
  { ssr: false, loading: () => <div className="h-[220px]" /> }
);

export { EloHistoryChart };
