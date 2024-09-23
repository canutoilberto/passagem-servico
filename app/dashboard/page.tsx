"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [technician, setTechnician] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    // Set current date
    const currentDate = new Date().toISOString().split("T")[0];
    setDate(currentDate);
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await addDoc(collection(db, "serviceReports"), {
        technician,
        date,
        description,
        userId: user?.uid,
        createdAt: new Date(),
      });
      setSubmitMessage("Relatório de serviço enviado com sucesso!");
      setTechnician("");
      setDescription("");
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      setSubmitMessage("Erro ao enviar relatório. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleSignOut}
          >
            <LogOut />
            Sair
          </Button>
        </div>
        <p className="mb-4">Bem-vindo, {user.email}!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="technician">Nome do Técnico</Label>
            <Input
              id="technician"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição do Serviço</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[150px]"
            />
          </div>
          <Button
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Relatório"}
          </Button>
        </form>
        {submitMessage && (
          <div
            className={`mt-4 p-2 rounded ${
              submitMessage.includes("sucesso")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {submitMessage}
          </div>
        )}
      </div>
    </div>
  );
}
