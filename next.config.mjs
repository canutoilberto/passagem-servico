/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MAILJET_API_KEY: process.env.MAILJET_API_KEY,
    MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY,
    MAILJET_SENDER_EMAIL: process.env.MAILJET_SENDER_EMAIL,
    MAILJET_SENDER_NAME: process.env.MAILJET_SENDER_NAME,
  },
};

export default nextConfig;
