import React from 'react';
import type { HeatingType } from '@/lib/pages';
import { TrvIcon } from './TrvIcon';
import { PilotWireIcon } from './PilotWireIcon';
import { HeatPumpIcon } from './HeatPumpIcon';
import { PelletStoveIcon } from './PelletStoveIcon';

const ICONS: Record<HeatingType, React.FC<React.SVGProps<SVGSVGElement>>> = {
    'trv': TrvIcon,
    'pilot-wire': PilotWireIcon,
    'heat-pump': HeatPumpIcon,
    'pellet-stove': PelletStoveIcon,
};

/** Icon of a heating type */
export const HeatingIcon: React.FC<{ type: HeatingType } & React.SVGProps<SVGSVGElement>> = ({ type, ...props }) => {
    const Icon = ICONS[type];
    return <Icon {...props} />;
};
