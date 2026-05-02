import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { launchStt, launchTts } from './daemon-client.ts';

const server = new McpServer({ name: 'stts-mcp', version: '1.0.0' });

server.registerTool(
  'stt',
  {
    description:
      'Show the speech-to-text dialog and return the transcribed text the user spoke.',
    inputSchema: {},
  },
  async () => {
    const text = await launchStt({
      title: 'Type or dictate',
      action: 'Send',
      initialText: '',
      startRecording: false,
    });
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
    await launchTts({
      title: 'Speak',
      action: 'Stop & Exit',
      text,
      oneshot: true,
    });
    return { content: [{ type: 'text', text: 'Spoken.' }] };
  }
);

await server.connect(new StdioServerTransport());
