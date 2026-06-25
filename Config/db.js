const { Sequelize } = require("sequelize");

// Railway aksar DB_HOST/DB_PORT se zyada reliable tarika deta hai: DATABASE_URL
// Example: mysql://user:pass@host:port/dbname
const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = (() => {
  if (DATABASE_URL) {
    return new Sequelize(DATABASE_URL, {
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        // some railway proxies may require this
        connectTimeout: 20000,
      },
    });
  }

  // Fallback (older env style)
  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mysql",
      logging: false,
    }
  );
})();

const initialize = async () => {
  // Helpful logs without leaking password
  const missing = [];
  if (!process.env.DATABASE_URL) {
    if (!process.env.DB_NAME) missing.push("DB_NAME");
    if (!process.env.DB_USER) missing.push("DB_USER");
    if (!process.env.DB_PASSWORD) missing.push("DB_PASSWORD");
    if (!process.env.DB_HOST) missing.push("DB_HOST");
    if (!process.env.DB_PORT) missing.push("DB_PORT");
  }

  if (missing.length) {
    throw new Error(`Missing DB env vars: ${missing.join(", ")}`);
  }

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.initialize = initialize;

