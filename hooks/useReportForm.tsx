"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendEmail } from "@/lib/emailService";
import { User } from "firebase/auth";

export function useReportForm(user: User | null) {
  const [technician, setTechnician] = useState("");
  const [officeTime, setOfficeTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const docRef = await addDoc(collection(db, "serviceReports"), {
        technician,
        officeTime,
        date,
        description,
        userId: user?.uid,
        createdAt: new Date(),
      });

      console.log(docRef);

      const emailSubject = `Novo Relatório Técnico - ${date}`;
      const emailText = `Novo relatório técnico criado por ${technician} em ${date}.\n\nDescrição: ${description}`;
      const emailHtml = `
        <h1>Novo Relatório Técnico</h1>
        <p><strong>Técnico:</strong> ${technician}</p>
        <p><strong>Expediente:</strong> ${officeTime}</p>
        <p><strong>Data:</strong> ${date}</p>
        <p><strong>Descrição:</strong></p>
        <p>${description}</p>
      `;

      const emailResult = await sendEmail({
        to: process.env.NEXT_PUBLIC_EMAIL_TO!,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      if (emailResult.success) {
        setSubmitMessage("Relatório enviado com sucesso! E-mail enviado.");
      } else {
        setSubmitMessage(
          "Relatório salvo, mas houve um erro ao enviar o e-mail."
        );
      }

      setTechnician("");
      setOfficeTime("");
      setDescription("");
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      setSubmitMessage("Erro ao enviar relatório. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    technician,
    setTechnician,
    officeTime,
    setOfficeTime,
    date,
    setDate,
    description,
    setDescription,
    isSubmitting,
    submitMessage,
    handleSubmit,
  };
}
