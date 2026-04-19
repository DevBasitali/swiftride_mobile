// Load env variables explicitly
try {
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv is not available
}

export default ({ config }) => {
  // Safe fallback if env variable is missing during local dev
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyCaEPPHig-6whefFn6_wSLffBIMReWs5gg";

  return {
    ...config,
    name: "Swiftride",
    slug: "swift-ride",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "swiftride",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-logo.png",
      resizeMode: "contain",
      backgroundColor: "#040B16",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.swiftride.app",
      config: {
        googleMapsApiKey: googleMapsApiKey,
      },
    },
    android: {
      package: "com.swiftride.app",
      usesCleartextTraffic: true,
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "swiftride",
              host: "reset-password",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "swiftride",
              host: "payment",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "@react-native-google-signin/google-signin",
      "@react-native-community/datetimepicker",
      "./plugins/withCleartextTraffic",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "This app needs your location to track your car rental trip for the host's peace of mind.",
          locationAlwaysPermission:
            "Allow SwiftRide to access your location in the background for car tracking during your rental.",
          locationWhenInUsePermission:
            "Allow SwiftRide to access your location while using the app.",
          isAndroidBackgroundLocationEnabled: true,
          isIosBackgroundLocationEnabled: true,
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow SwiftRide to access your camera to scan QR codes and take photos for car handover.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...config.extra,
      eas: {
        projectId: "6f4f5114-d856-4723-884c-2b4ba0eaca24",
      },
    },
  };
};
