import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "DUTA RANTAU | Bersama • Terhubung • Berdaya",
  description: "Web App Komuniti Indonesia di Malaysia & Global. Wadah usulan, jejaring komunitas, lowongan kerja, agenda silaturahmi, dan bantuan darurat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen selection:bg-red-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
