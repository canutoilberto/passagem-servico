interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, text, html }),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar e-mail");
    }

    const result = await response.json();
    console.log("E-mail enviado com sucesso:", result);
    return { success: true, message: "E-mail enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { success: false, message: "Falha ao enviar e-mail", error };
  }
}
