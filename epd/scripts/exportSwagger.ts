import { swaggerSpec } from '../backend/src/config/swagger';
import fs from 'fs';
import path from 'path';

const outPath = path.resolve(__dirname, '../../frontend/openapi.json');
fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));
console.log('Wrote OpenAPI spec to', outPath);