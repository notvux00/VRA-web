"use client";

import React from "react";
import ChatInterface from "../../_components/ChatInterface";

export default function ParentMessagesPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto h-full animate-in fade-in duration-700">
      <ChatInterface role="parent" />
    </div>
  );
}
