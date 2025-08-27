"use client";

import Hero from "./(components)/Hero";
import HomeSections from "./(components)/HomeSections";

export default function Home() {
  return (
    <div className="min-h-screen w-full font-sans">
      <Hero />
      <HomeSections />
    </div>
  );
}