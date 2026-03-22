import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "VedaAI – AI Assessment Creator",
  description: "Create intelligent question papers powered by AI",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-surface-50 text-surface-900">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#18181b",
              color: "#fafafa",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
