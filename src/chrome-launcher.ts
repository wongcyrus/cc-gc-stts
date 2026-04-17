import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIXED_PORT = 15986;

export interface SttConfig {
  title: string;
  action: string;
  initialText: string;
  startRecording: boolean;
}

export interface TtsConfig {
  title: string;
  action: string;
  text: string;
  oneshot: boolean;
}

function pingDaemon(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port: FIXED_PORT,
        path: '/api/ping',
        method: 'GET',
        timeout: 500,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function resolveDaemonScript(): string {
  const candidates = [
    path.join(__dirname, 'stts-daemon.mjs'),
    path.join(__dirname, 'stts-daemon.js'),
    path.join(__dirname, '..', 'dist', 'stts-daemon.mjs'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function spawnDaemon(): void {
  const script = resolveDaemonScript();
  const child = spawn(process.execPath, [script], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  child.unref();
}

async function ensureDaemon(): Promise<void> {
  if (await pingDaemon()) return;
  spawnDaemon();
  for (let i = 0; i < 80; i++) {
    await new Promise((r) => setTimeout(r, 100));
    if (await pingDaemon()) return;
  }
  throw new Error('stts daemon failed to start');
}

function postRequest(body: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port: FIXED_PORT,
        path: '/request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');
          if (res.statusCode === 409) {
            reject(new Error('stts daemon is busy with another request'));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`stts daemon returned ${res.statusCode}: ${raw}`));
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            resolve(typeof parsed.text === 'string' ? parsed.text : '');
          } catch (e) {
            reject(e as Error);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

export async function launchStt(config: SttConfig): Promise<string> {
  await ensureDaemon();
  return postRequest({ mode: 'stt', ...config });
}

export async function launchTts(config: TtsConfig): Promise<void> {
  await ensureDaemon();
  await postRequest({ mode: 'tts', ...config });
}
