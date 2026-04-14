import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const DIST_DIR = path.dirname(fileURLToPath(import.meta.url));
const STT_SCRIPT = path.join(DIST_DIR, 'stt.mjs');
const TTS_SCRIPT = path.join(DIST_DIR, 'tts.mjs');

function runChild(script: string, args: string[] = [], input?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    const chunks: Buffer[] = [];
    child.stdout.on('data', (d: Buffer) => chunks.push(d));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`${path.basename(script)} exited with code ${code}`));
        return;
      }
      resolve(Buffer.concat(chunks).toString('utf8').trim());
    });

    if (input) child.stdin.end(input);
    else child.stdin.end();
  });
}

const server = new McpServer({ name: 'stts-mcp', version: '1.0.0' });

server.registerTool(
  'stt',
  {
    description:
      'Show the speech-to-text dialog and return the transcribed text the user spoke.',
    inputSchema: {},
  },
  async () => {
    const text = await runChild(STT_SCRIPT);
    return { content: [{ type: 'text', text }] };
  }
);

server.registerTool(
  'tts',
  {
    description: 'Send a string to the text-to-speech dialog to be spoken aloud.',
    inputSchema: {
      text: z.string().describe('The text to speak'),
    },
  },
  async ({ text }) => {
    await runChild(TTS_SCRIPT, ['--oneshot'], text);
    return { content: [{ type: 'text', text: 'Spoken.' }] };
  }
);

await server.connect(new StdioServerTransport());
