import { DataSource } from 'typeorm';

env();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'ger_fin',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['migrations/*.ts'],
});

function env() {
  // Load .env if available
  try {
    require('dotenv').config();
  } catch {}
}
