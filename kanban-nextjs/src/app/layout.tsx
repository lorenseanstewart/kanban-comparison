import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "A Trello-inspired Kanban board application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div data-theme="pastel" className="min-h-screen bg-base-300 text-base-content">
          {children}
        </div>
      </body>
    </html>
  );
}
