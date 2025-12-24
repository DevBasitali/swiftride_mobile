const IP_ADDRESS = process.env.EXPO_PUBLIC_SERVER_IP;
const PORT = process.env.EXPO_PUBLIC_SERVER_PORT;

console.log("IP ADDRESS:", IP_ADDRESS);
console.log("PORT:", PORT);
const Config = {
  API_URL: `http://${IP_ADDRESS}:${PORT}/api`,
};

export default Config;
