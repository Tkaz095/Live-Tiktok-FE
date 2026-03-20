import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./../index.css";
import { AuthProvider } from "@/features/shared-auth/stores/AuthContext";
import { ThemeProvider } from "@/features/shared-theme/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TikTok Live Multi-Monitor Dashboard",
  description: "Monitor multiple TikTok Live streams easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
