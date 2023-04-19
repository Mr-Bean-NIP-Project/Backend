import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import dbConfig from './db.config';
import validationSchema from '../src/common/validation.schema';

ConfigModule.forRoot({
  isGlobal: true,
  load: [dbConfig],
  validationSchema,
});

export default new DataSource(dbConfig());
