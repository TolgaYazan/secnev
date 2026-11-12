import { ingestAll } from "../ingest.js";

const result = await ingestAll();
console.log(JSON.stringify(result, null, 2));
if (result.failed > 0) process.exitCode = 1;
