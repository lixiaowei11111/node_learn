import { config } from 'dotenv';
import { z } from 'zod';
import {resolve} from '../util'


config({ path: [resolve(".env")] });
const portSchema = z.preprocess(
  (val) => parseInt(val as string, 10),
  z.number().min(1).max(65535).refine(
    (val) => !isNaN(val),
    { message: '端口号必须是有效的数字' }
  )
);

export default portSchema.parse(process.env.PORT);
