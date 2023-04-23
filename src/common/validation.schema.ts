import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
  PORT: Joi.number().default(3000),
  DATABASE_PATH: Joi.string().default('db'),
  FRONTEND_ORIGIN: Joi.string().default('http://localhost:3001'),
});
