/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:rfYmU3aXIw7E@ep-curly-mouse-a5kq1es9.us-east-2.aws.neon.tech/neondb?sslmode=require',
    }
  };
  