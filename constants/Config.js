// 1. Check if we have a full custom URL (like Vercel)
const CUSTOM_URL = process.env.EXPO_PUBLIC_API_URL;

// 2. Get Local details (Fallback)
const IP_ADDRESS = process.env.EXPO_PUBLIC_SERVER_IP;
const PORT = process.env.EXPO_PUBLIC_SERVER_PORT;

// 3. Decide which one to use
// If CUSTOM_URL exists, use it. Otherwise, construct the local URL.
const finalUrl = CUSTOM_URL ? CUSTOM_URL : `http://${IP_ADDRESS}:${PORT}/api`;

console.log("🔗 Connecting to:", finalUrl);

const Config = {
  API_URL: finalUrl,
};

export default Config;

// const IP_ADDRESS = process.env.EXPO_PUBLIC_SERVER_IP;
// const PORT = process.env.EXPO_PUBLIC_SERVER_PORT;

// console.log("IP ADDRESS:", IP_ADDRESS);
// console.log("PORT:", PORT);
// const Config = {
//   API_URL: `http://${IP_ADDRESS}:${PORT}/api`,
// };

// export default Config;
