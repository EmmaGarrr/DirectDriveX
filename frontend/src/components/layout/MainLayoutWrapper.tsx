"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/admin-panel');

  // If it's an admin route, render only the children (which will be the admin layout)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Otherwise, render the standard website layout with Header, main content, and Footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}