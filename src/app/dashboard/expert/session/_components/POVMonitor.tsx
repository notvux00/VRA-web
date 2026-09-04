"use client";

import React from "react";
import { LiveKitPOVViewer } from "@/components/livekit/LiveKitPOVViewer";

interface POVMonitorProps {
  telemetry?: unknown;
  childName?: string;
  stream?: MediaStream | null;
  connectionState?: string;
}

export default function POVMonitor({ telemetry, childName }: POVMonitorProps) {
  return <LiveKitPOVViewer telemetry={telemetry} childName={childName} />;
}
