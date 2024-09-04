"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "./(authentication)/layout";
import { Landing } from "@/components/landing";

export default function Home() {
  return <Landing />;
}
