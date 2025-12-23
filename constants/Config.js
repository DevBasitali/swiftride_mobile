const IP_ADDRESS = process.env.EXPO_PUBLIC_SERVER_IP || "192.168.18.19";
const PORT = process.env.EXPO_PUBLIC_SERVER_PORT || "5000";

console.log("IP_ADDRESS", IP_ADDRESS);
console.log("PORT", PORT);

const Config = {
  API_URL: `http://${IP_ADDRESS}:${PORT}/api`,
};

export default Config;

// // const IP_ADDRESS = '192.168.1.4';
// const IP_ADDRESS = "192.168.1.5";
// // const IP_ADDRESS = '127.0.0.1';
// const PORT = "5000";
// // const PORT = "8000";

// const Config = {
//   API_URL: `http://${IP_ADDRESS}:${PORT}/api`,
// };

// export default Config;
