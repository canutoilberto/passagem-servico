import nodemailer from "nodemailer";

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso");
    return { success: true, message: "E-mail enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { success: false, message: "Falha ao enviar e-mail", error };
  }
}
