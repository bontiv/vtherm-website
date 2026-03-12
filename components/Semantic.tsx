import { languages } from "@/app/i18n/settings"
import Script from "next/script"
import { PropsWithChildren } from "react"
import { Graph, Thing, WithContext } from "schema-dts"

const sem_data: Graph = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@id": "https://www.versatile-thermostat.org/#website",
            "@type": "WebSite",
            "name": "Versatile Thermostat",
            "url": process.env.NEXT_PUBLIC_SITE_URL,
            "inLanguage": languages,
            "maintainer": {
                "@type": "Person",
                "@id": "https://www.versatile-thermostat.org/#bontiv",
                "name": "Bontiv",
                "familyName": "BONNET",
                "givenName": "Remi",
                "url": "https://github.com/bontiv"
            },
            about: {
                "@id": "https://www.versatile-thermostat.org/#software"
            }
        },
        {
            "@type": "SoftwareApplication",
            "@id": "https://www.versatile-thermostat.org/#software",
            name: "Versatile Thermostat Integration",
            "alternateName": "VTherm",
            "url": process.env.NEXT_PUBLIC_SITE_URL,
            "applicationCategory": "HomeAssistantApplication",
            "operatingSystem": "Home Assistant",
            "downloadUrl": "https://my.home-assistant.io/redirect/hacs_repository/?owner=jmcollin78&repository=versatile_thermostat",
            "author": {
                "@type": "Person",
                "@id": "https://www.versatile-thermostat.org/#jmc",
                "name": "Jean-Marc Collin",
                "url": "https://github.com/jmcollin78"
            },
            maintainer: {
                "@id": "https://www.versatile-thermostat.org/#jmc",
            },
            offers: {
                "@type": "Offer",
                price: 0,
                priceCurrency: "EUR",
            },
            "publisher": { "@id": "https://www.versatile-thermostat.org/#organization" }
        },
        {
            "@type": "Organization",
            "@id": "https://www.versatile-thermostat.org/#organisation",
            url: process.env.NEXT_PUBLIC_SITE_URL,
            logo: `${process.env.NEXT_PUBLIC_SITE_URL}/opengraph-image.png`
        }
    ]
}

const Semantic: React.FC<{ data?: WithContext<Thing> }> = ({ data }) => {
    return <Script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(data ?? sem_data).replace(/</g, '\\u003c'),
    }} />
}

export default Semantic;