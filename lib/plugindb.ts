export type VTPluginType = 'integration' | 'interface' | 'blueprint' | 'addon';
export type VTCertificationLevel = 'official' | 'recommended' | 'community';

export interface VTPlugin {
    /**
     * The display name of the plugin
     */
    name: string;

    /**
     * A short description of the plugin, ideally one sentence. This will be shown in the plugin card, so it should be concise and informative.
     */
    description: string;

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
}
