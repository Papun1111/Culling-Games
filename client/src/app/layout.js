import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthParams";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "The Culling Game: Protocol",
  description: "Jujutsu Kaisen Gamified Productivity System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#ededed]`}
      >
        {/* 1. Wrap everything in AuthProvider so we can access User Session anywhere */}
        <AuthProvider>
          
          <div className="min-h-screen flex flex-col relative">
            
            {/* 2. The Navigation Bar (Fixed to top on Desktop, bottom on Mobile) */}
            <Navbar />

            {/* 3. Main Content Wrapper */}
            {/* We add padding (pb-24/pt-24) so the fixed Navbar doesn't cover your content */}
            <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pt-24 md:pb-10">
              {children}
            </main>

          </div>
        </AuthProvider>
      </body>
    </html>
  );
}