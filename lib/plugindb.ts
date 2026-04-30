export type VTPluginType = 'integration' | 'interface' | 'blueprint' | 'addon';
export type VTCertificationLevel = 'official' | 'recommended' | 'community';
export type VTPluginFamily = 'algorithm' | 'interface' | 'device-helper';

export interface VTPlugin {
    /**
     * The display name of the plugin
     */
    name: string;
    name_fr?: string;
    name_de?: string;

    /**
     * A short description of the plugin, ideally one sentence. This will be shown in the plugin card, so it should be concise and informative.
     */
    description: string;
    description_fr?: string;
    description_de?: string;

    /**
     * The type of the plugin, which determines its category and styling. This should be one of the following values:
     * - "integration": A plugin that integrates with an external service or platform.
     * - "interface": A plugin that provides a user interface component or dashboard.
     * - "blueprint": A plugin that offers a reusable blueprint or template for common use cases.
     * - "addon": A plugin that extends the functionality of another plugin or the core system.
     */
    type: VTPluginType;

    /**
     * The certification level of the plugin, which indicates its quality and reliability. This should be one of the following values:
     * - "official": A plugin that is officially supported and maintained by the VT team, meeting the highest standards of quality and security.
     * - "recommended": A plugin that is recommended by the VT team, having been reviewed and tested for good performance and reliability.
     * - "community": A plugin that is contributed by the community, which may vary in quality and maintenance status, but can still provide valuable functionality.
     */
    certification: VTCertificationLevel;

    /**
     * A unique identifier for the plugin, used in URLs and other references.
     */
    slug: string;

    /**
     * The author or maintainer of the plugin, which can be a person or an organization. This is optional but can provide useful context and credibility for users interested in the plugin.
     */
    author?: string;


    /**
     * A URL to the plugin's download. This is optional but can help users find more information about the plugin and how to use it.
     */
    url?: string;


    /**
     * The family to which the plugin belongs, which can be used for further categorization and filtering. This is optional but can help users discover related plugins and understand the plugin's purpose and functionality better. The possible values are:
     * - "algorithm": A plugin that implements a specific algorithm or logic for the VT, such as a control strategy, a data processing method, or a machine learning model.
     * - "interface": A plugin that provides a user interface component or dashboard for the VT, such as a custom card, a settings page, or a visualization tool.
     * - "device-helper": A plugin that helps integrate a specific device or hardware with the VT, such as a smart thermostat, a sensor, or an actuator.
     */
    family?: VTPluginFamily;
}


export const typeConfig = {
    blueprint: {
        color: '#306BE5',
        bgColor: 'rgba(48, 107, 229, 0.08)'
    },
    integration: {
        color: '#E67249',
        bgColor: 'rgba(230, 114, 73, 0.08)'
    },
    interface: {
        color: '#3EB0F2',
        bgColor: 'rgba(62, 176, 242, 0.08)'
    },
    addon: {
        color: '#9F7EEA',
        bgColor: 'rgba(159, 126, 234, 0.08)'
    }
};

export const certConfig = {
    official: {
        color: 'var(--color-vtherm-tertiary)',
        icon: '★'
    },
    recommended: {
        color: 'var(--color-vtherm-quaternary)',
        icon: '◆'
    },
    community: {
        color: 'var(--color-vtherm-secondary)',
        icon: '●'
    }
};

export const familyConfig = {
    algorithm: {
        color: 'var(--color-vtherm-tertiary)',
        icon: '',
    },
    interface: {
        color: 'var(--color-vtherm-quaternary)',
        icon: '',
    },
    'device-helper': {
        color: 'var(--color-vtherm-secondary)',
        icon: '',
    }
};