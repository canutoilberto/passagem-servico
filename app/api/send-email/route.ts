import { NextResponse } from "next/server";
import Mailjet from "node-mailjet";

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || "",
  apiSecret: process.env.MAILJET_SECRET_KEY || "",
});

export async function POST(request: Request) {
  const { to, subject, text, html } = await request.json();

  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL || "",
            Name: process.env.MAILJET_SENDER_NAME || "",
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    });

    console.log("E-mail enviado com sucesso:", result.body);
    return NextResponse.json({ message: "E-mail enviado com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json(
      { message: "Falha ao enviar e-mail", error },
      { status: 500 }
    );
  }
}
