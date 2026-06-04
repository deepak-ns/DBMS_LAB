const axios = require("axios");

const askLLM = async (question) => {
  const response = await axios.post(process.env.AI_SERVICE_URL || "http://localhost:8000/ask", { question });
  return response.data?.response?.toString() || "";
};

module.exports = { askLLM };
