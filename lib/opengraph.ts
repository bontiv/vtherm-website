import { Metadata } from "next";

export const opengraph_defaults: Metadata['openGraph'] = {
    images: [{
        url: `/opengraph-image.png`,
        width: 512,
        height: 512,
        alt: 'Versatile Thermostat LOGO'
    }
    ],
    type: "website",
    siteName: "Versatile Thermostat"
}