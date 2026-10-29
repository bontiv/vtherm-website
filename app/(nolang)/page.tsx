'use client';

import Link from "next/link";
import { useEffect } from "react";
import i18n from "@/app/i18n/i18next";
import { fallbackLng } from "../i18n/settings";
import Semantic from "@/components/Semantic";


export default function Home() {
  useEffect(() => {
    const browser_lng = i18n.resolvedLanguage ?? fallbackLng;
    console.log("Detected browser language:", browser_lng);
    window.location.replace(`/${browser_lng}/`);
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <Semantic id="noland" />
      <h1 className="text-3xl">Versatile Thermostat</h1>
      <p>
        Versatile Thermostat is an advanced thermostat integration for Home Assistant.
        It works with any existing climate, switch or valve entity and offers smart calibration,
        boiler control and a TPI algorithm for optimal comfort and energy savings.
      </p>
      <p>You will be redirected to the version of the site in your language.</p>
      <ul>
        <li>
          <Link href="/en/" hrefLang="en" lang="en" className="text-blue-500 hover:underline">
            Go to the English version of the site.
          </Link>
        </li>
        <li>
          <Link href="/fr/" hrefLang="fr" lang="fr" className="text-blue-500 hover:underline">
            Aller sur la version française du site.
          </Link>
        </li>
        <li>
          <Link href="/de/" hrefLang="de" lang="de" className="text-blue-500 hover:underline">
            Zur deutschen Version der Website.
          </Link>
        </li>
      </ul>
    </main>
  );
}
