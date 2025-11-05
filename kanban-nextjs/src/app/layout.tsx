import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional", // Render immediately without waiting for font
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional", // Render immediately without waiting for font
  preload: true,
  adjustFontFallback: true,
});

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
      <head>
        {/* Hide content until CSS loads to prevent FOUC */}
        <style dangerouslySetInnerHTML={{__html: `
          body { visibility: hidden; }
          .css-loaded { visibility: visible; }
        `}} />

        <Script id="async-css" strategy="beforeInteractive">
          {`
            // Make CSS non-blocking by converting link tags to load asynchronously
            // This script runs before CSS is processed, preventing render blocking
            (function() {
              var cssLoaded = 0;
              var cssTotal = 0;
              var links = document.getElementsByTagName('link');

              // Count stylesheet links
              for (var i = 0; i < links.length; i++) {
                if (links[i].rel === 'stylesheet' && !links[i].media) {
                  cssTotal++;
                }
              }

              // Transform links and track loading
              for (var i = 0; i < links.length; i++) {
                var link = links[i];
                if (link.rel === 'stylesheet' && !link.media) {
                  link.media = 'print';  // Low priority, non-blocking
                  link.onload = function() {
                    this.media = 'all';
                    cssLoaded++;
                    // Once all CSS is loaded, show content
                    if (cssLoaded === cssTotal) {
                      document.body.classList.add('css-loaded');
                    }
                  };
                }
              }

              // Fallback: show content after 3 seconds even if CSS hasn't loaded
              setTimeout(function() {
                document.body.classList.add('css-loaded');
              }, 3000);
            })();
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div data-theme="pastel" className="min-h-screen bg-base-300 text-base-content">
          {children}
        </div>
      </body>
    </html>
  );
}
