"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "./(authentication)/layout";
import { Landing } from "@/components/landing";

export default function App() {
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
  };

  const handleSuccessfulAuth = () => {
    router.push("/dashboard");
  };

  return (
    <div>
      <Landing />
    </div>
  );
}
