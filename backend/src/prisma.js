const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();

module.exports = prisma;
