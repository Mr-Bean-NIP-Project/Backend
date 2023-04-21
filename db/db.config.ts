import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

const SQLIITE = 'sqlite';

export default registerAs('database', () => {
  return {
    type: SQLIITE,
    database: process.env.DATABASE_PATH.endsWith(`.${SQLIITE}`)
      ? process.env.DATABASE_PATH
      : `${process.env.DATABASE_PATH}.${SQLIITE}`,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
  } as DataSourceOptions;
});
