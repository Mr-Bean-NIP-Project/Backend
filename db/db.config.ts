import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export default registerAs('database', () => {
  return {
    type: 'sqlite',
    database: `./${process.env.DATABASE_NAME}.sqlite`,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
  } as DataSourceOptions;
});
