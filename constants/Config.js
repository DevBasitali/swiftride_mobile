const PRODUCTION_URL = process.env.EXPO_PUBLIC_API_URL;
const LOCAL_IP = process.env.EXPO_PUBLIC_SERVER_IP;
const LOCAL_PORT = process.env.EXPO_PUBLIC_SERVER_PORT;

let API_URL;

if (PRODUCTION_URL) {
  API_URL = PRODUCTION_URL;
} else if (LOCAL_IP && LOCAL_PORT) {
  API_URL = `http://${LOCAL_IP}:${LOCAL_PORT}/api`;
} else {
  console.error(
    "❌ No API URL configured! Set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_SERVER_IP + EXPO_PUBLIC_SERVER_PORT in .env",
  );
  throw new Error("Missing API configuration in .env");
}

console.log("🔗 Connecting to:", API_URL);

const Config = {
  API_URL,
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  LOCATION_INTERVAL_MS: parseInt(
    process.env.EXPO_PUBLIC_LOCATION_INTERVAL_MS || "5000",
    10,
  ),
};

export default Config;
