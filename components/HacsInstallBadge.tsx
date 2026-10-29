import React from 'react';
import Image from 'next/image';

/** my.home-assistant.io badge opening a jmcollin78 repository (Versatile Thermostat by default) in the visitor's HACS */
export const HacsInstallBadge: React.FC<{ className?: string, repository?: string }> = ({ className, repository = 'versatile_thermostat' }) => (
    <a className={className}
        href={`https://my.home-assistant.io/redirect/hacs_repository/?owner=jmcollin78&repository=${repository}&category=integration`}
        target="_blank"
        rel="noreferrer noopener"
    ><Image src="https://my.home-assistant.io/badges/hacs_repository.svg" height={40} width={297} alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store." />
    </a>
);
