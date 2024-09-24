"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
      // Adicione um pequeno atraso para garantir uma transição suave
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [user, loading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Esta parte provavelmente nunca será renderizada devido ao redirecionamento
  return null;
}
