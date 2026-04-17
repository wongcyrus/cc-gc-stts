import { program } from 'commander';
import { launchStt, launchTts } from './chrome-launcher.ts';

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function runStt(argv: string[]) {
  const sub = program
    .name('stts stt')
    .description('Speech to Text GUI')
    .version('1.0.0')
    .option('--title <title>', 'Title of the page', 'Type or dictate')
    .option('--action <label>', 'Label for the complete button', 'Send')
    .option('--start-recording', 'Start in recording mode')
    .argument('[text...]', 'Initial text')
    .helpOption('-h, --help', 'Display help for command')
    .parse(argv, { from: 'user' });

  const options = sub.opts();
  let initialText = (sub.args || []).join(' ');

  const stdinText = await readStdin();
  if (stdinText) {
    initialText = initialText ? `${initialText}\n${stdinText}` : stdinText;
  }

  try {
    const text = await launchStt({
      title: options.title,
      action: options.action,
      initialText,
      startRecording: !!options.startRecording,
    });
    if (text) {
      process.stdout.write(text + '\n');
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed to launch prompt:', err);
    process.exit(1);
  }
}

async function runTts(argv: string[]) {
  const sub = program
    .name('stts tts')
    .description('Text to Speech GUI')
    .version('1.0.0')
    .option('--title <title>', 'Title of the page', 'Speak')
    .option('--action <label>', 'Label for the action button', 'Stop & Exit')
    .option('--oneshot', 'Just speak the passed in text and exit')
    .argument('[text...]', 'Text to speak')
    .helpOption('-h, --help', 'Display help for command')
    .parse(argv, { from: 'user' });

  const options = sub.opts();
  let textToSpeak = (sub.args || []).join(' ');

  const stdinText = await readStdin();
  if (stdinText) {
    textToSpeak = textToSpeak ? `${textToSpeak}\n${stdinText}` : stdinText;
  }

  try {
    await launchTts({
      title: options.title,
      action: options.action,
      text: textToSpeak,
      oneshot: !!options.oneshot,
    });
    process.exit(0);
  } catch (err) {
    console.error('Failed to launch speaker:', err);
    process.exit(1);
  }
}

const [mode, ...rest] = process.argv.slice(2);

if (mode === 'stt') {
  await runStt(rest);
} else if (mode === 'tts') {
  await runTts(rest);
} else {
  console.error('Usage: stts <stt|tts> [options] [text...]');
  process.exit(1);
}
