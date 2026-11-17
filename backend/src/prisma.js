const path = require('path');
const { PrismaClient } = require('./generated/client');

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:.')) {
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

module.exports = prisma;
