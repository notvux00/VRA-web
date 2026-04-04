"use client";

import React from "react";
import ChatInterface from "../../_components/ChatInterface";
import { MessageSquare } from "lucide-react";

export default function ExpertMessagesPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto h-full animate-in fade-in duration-700">
      <ChatInterface role="expert" />
    </div>
  );
}
