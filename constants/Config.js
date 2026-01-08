const PRODUCTION_API_URL = "http://34.47.183.227:5000/api";

const CUSTOM_URL = process.env.EXPO_PUBLIC_API_URL;
const IP_ADDRESS = process.env.EXPO_PUBLIC_SERVER_IP;
const PORT = process.env.EXPO_PUBLIC_SERVER_PORT;

let finalUrl;
if (CUSTOM_URL) {
  finalUrl = CUSTOM_URL;
} else if (IP_ADDRESS && PORT) {
  finalUrl = `http://${IP_ADDRESS}:${PORT}/api`;
} else {
  finalUrl = PRODUCTION_API_URL;
  console.warn("⚠️ Using hardcoded production URL - env vars not found");
}

console.log("🔗 Connecting to:", finalUrl);

const Config = {
  API_URL: finalUrl,
};

export default Config;
