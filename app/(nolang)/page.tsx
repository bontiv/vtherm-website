'use client';

import Link from "next/link";
import { useEffect } from "react";
import i18n from "@/app/i18n/i18next";
import { fallbackLng } from "../i18n/settings";


export default function Home() {
  useEffect(() => {
    const browser_lng = i18n.language ?? fallbackLng;
    console.log("Detected browser language:", browser_lng);
    window.location.href = `/${browser_lng}/`;
  }, []);

  return (
    <div>
      <p>You will be redirected to your langage.</p>
      <ul>
        <li>
          <Link href="/en/" className="text-blue-500 hover:underline">
            Go to the English version of the site.
          </Link>
        </li>
        <li>
          <Link href="/fr/" className="text-blue-500 hover:underline">
            Aller sur la version française du site.
          </Link>
        </li>
      </ul>
    </div>
  );
}
