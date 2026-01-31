import "dotenv/config";

export default {
  schema: './schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
