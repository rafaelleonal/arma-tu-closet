import { createGarmentServer } from './app';
import { createOpenAiAnalyzer, DEFAULT_OPENAI_MODEL } from './openai';

const port = Number(process.env.AI_SERVER_PORT || 8787);
if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('AI_SERVER_PORT debe ser un puerto válido.');
const key = process.env.OPENAI_API_KEY?.trim();
const analyze = key ? createOpenAiAnalyzer(key, process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL) : undefined;
const server = createGarmentServer({ analyze });
server.on('error', () => { console.error('No se pudo iniciar el servidor local de análisis. Revisa AI_SERVER_PORT.'); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  console.log(`Servidor de análisis local: http://127.0.0.1:${port}${analyze ? '' : ' · Sin OPENAI_API_KEY; análisis desactivado.'}`);
});
