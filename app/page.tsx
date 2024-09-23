"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  // Exibir um indicador de carregamento enquanto verifica o estado de autenticação
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-2xl font-semibold text-gray-800">Carregando...</div>
    </div>
  );
}
