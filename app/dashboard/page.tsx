"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReportForm } from "@/hooks/useReportForm";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    technician,
    setTechnician,
    setOfficeTime,
    date,
    setDate,
    description,
    setDescription,
    isSubmitting,
    submitMessage,
    handleSubmit,
  } = useReportForm(user);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Formulário de Ocorrências</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/reports")}
              className="w-full text-white bg-blue-500 hover:bg-blue-600 sm:w-auto "
            >
              Ver Relatórios
            </Button>
            <Button
              onClick={handleSignOut}
              className="rounded-md text-white bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Sair
            </Button>
          </div>
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
            <Select onValueChange={setOfficeTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Expediente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="bg-white text-gray-900">
                  <SelectLabel>Horário de Trabalho</SelectLabel>
                  <SelectItem value="05:00 - 14:00">05:00 - 14:00</SelectItem>
                  <SelectItem value="08:00 - 18:00">08:00 - 18:00</SelectItem>
                  <SelectItem value="09:00 - 18:00">09:00 - 18:00</SelectItem>
                  <SelectItem value="10:00 - 20:00">10:00 - 20:00</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
            type="submit"
            disabled={isSubmitting}
            className="rounded-md text-white bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
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
