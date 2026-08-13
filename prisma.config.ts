// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};
