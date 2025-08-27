"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./(components)/Navbar";
import Footer from "./(components)/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem("isAdminView");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("isAdminView", JSON.stringify(isAdminView));
  }, [isAdminView]);

  return (
    <html lang="en">
      <head>
        <title>Harbor Hub</title>
        <meta name="description" content="Harbor Hub - Your trusted partner for mental health and wellness services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`}
          async
          defer
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar isAdminView={isAdminView} setIsAdminView={setIsAdminView} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
