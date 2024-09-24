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
import { sendEmail } from "@/lib/emailService";

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
      // Adicionar relatório ao Firestore
      const docRef = await addDoc(collection(db, "serviceReports"), {
        technician,
        date,
        description,
        userId: user?.uid,
        createdAt: new Date(),
      });
      console.log("Documento criado com ID: ", docRef.id);

      // Enviar e-mail
      const emailSubject = `Novo Relatório Técnico - ${date}`;
      const emailText = `Um novo relatório técnico foi criado por ${technician} em ${date}.\n\nDescrição: ${description}`;
      const emailHtml = `
        <h1>Novo Relatório Técnico</h1>
        <p><strong>Técnico:</strong> ${technician}</p>
        <p><strong>Data:</strong> ${date}</p>
        <p><strong>Descrição:</strong></p>
        <p>${description}</p>
      `;

      const emailTo = process.env.NEXT_PUBLIC_EMAIL_TO;
      if (!emailTo) {
        throw new Error(
          "NEXT_PUBLIC_EMAIL_TO não está definido nas variáveis de ambiente"
        );
      }

      const emailResult = await sendEmail({
        to: emailTo,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      if (emailResult.success) {
        setSubmitMessage(
          "Relatório de serviço enviado com sucesso! E-mail enviado."
        );
      } else {
        setSubmitMessage(
          "Relatório salvo, mas houve um problema ao enviar o e-mail."
        );
      }

      setDescription("");
    } catch (error) {
      console.error("Erro ao processar relatório:", error);
      setSubmitMessage(
        "Erro ao processar relatório. Por favor, tente novamente."
      );
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Formulário de Ocorrências</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/reports")}
              className="w-full sm:w-auto"
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
