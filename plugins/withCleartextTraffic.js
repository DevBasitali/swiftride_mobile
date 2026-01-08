const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");

/**
 * Expo config plugin to enable cleartext (HTTP) traffic for Android
 * This is required for EAS builds to connect to HTTP backends
 */
const withCleartextTraffic = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        // Ensure the application element exists
        const application = androidManifest.manifest.application?.[0];
        if (application) {
            // Set usesCleartextTraffic to true
            application.$["android:usesCleartextTraffic"] = "true";

            // Also ensure networkSecurityConfig attribute is NOT set
            // (it can override usesCleartextTraffic)
            delete application.$["android:networkSecurityConfig"];
        }

        return config;
    });
};

module.exports = withCleartextTraffic;
