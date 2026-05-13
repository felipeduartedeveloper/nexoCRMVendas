import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'crmvendas',
  password: process.env.DB_PASSWORD || 'crmvendaspass',
  database: process.env.DB_NAME || 'crmvendas_db',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: process.env.DB_SYNC === 'true',
  migrationsRun: process.env.DB_RUN_MIGRATIONS === 'true',
  logging: false,
  autoLoadEntities: true,
});
