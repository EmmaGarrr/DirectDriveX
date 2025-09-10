import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mfcnextgen - Secure File Sharing",
  description: "Transfer files up to 30GB with bank-level security",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: '32x32' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3B82F6' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3B82F6" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}