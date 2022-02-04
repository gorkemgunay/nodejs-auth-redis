const redis = require("redis");

const client = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
});

client.on("connect", () => {
  console.log("Connected to redis.");
});

client.on("ready", () => {
  console.log("Redis ready to use.");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("end", () => {
  console.log("Disconnected from redis");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;
