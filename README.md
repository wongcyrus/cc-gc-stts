# cc-gc-stts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-blue.svg)](https://nodejs.org/)

Talk to **Claude Code** or **Gemini CLI** and hear them talk back. This project adds seamless Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities via a Model Context Protocol (MCP) server.

![Talk](screenshots/stts-prompt.png)
![Listen](screenshots/stts-response.png)

## ✨ Features

- 🎙️ **Speech-to-Text (STT):** Dictate your prompts instead of typing.
- 🔊 **Text-to-Speech (TTS):** Hear the model's responses read aloud.
- 🔄 **Conversational Loop:** Use the `/stts` command for a continuous voice-driven session.
- 🚀 **Persistent Daemon:** Fast startup using a reusable Chrome window.
- 🛠️ **Cross-Platform:** Works with both Claude Code and Gemini CLI.

## 🏗️ How It Works

`stts` uses a background daemon to manage a persistent Chrome/Chromium window:

1.  **MCP Server:** Exposes `stt` and `tts` tools to the AI model.
2.  **Daemon:** A local HTTP server (port `15986`) that controls a Chrome instance in "app mode".
3.  **Browser UI:** Uses the native **Web Speech API** for high-quality, zero-cost recognition and synthesis.
4.  **Automatic Lifecycle:** The daemon starts on demand and shuts down when the Chrome window is closed.

## 🚀 Quick Start

### 1. Build the project

```bash
npm install
npm run build
```

### 2. Install

#### **Claude Code**
```bash
claude plugins marketplace add https://github.com/sandipchitale/cc-gc-stts.git
claude plugin install stts
```

#### **Gemini CLI**
```bash
gemini extensions install --consent https://github.com/sandipchitale/cc-gc-stts.git
```

## ⌨️ Usage

### Conversational Loop
Run the voice-driven loop where you speak, the model processes, and the response is read back to you:
- **Claude Code:** `/stts`
- **Gemini CLI:** `/stts`

### Direct Tool Usage
You can also ask the model to "use the stt tool" or "speak this using tts" directly in your prompts.

## 🗣️ Voice Commands & Shortcuts

Both STT and TTS modes support voice-activated commands for a hands-free experience.

### Popular Commands
| Command | Action |
| :--- | :--- |
| `send prompt` | Submits your dictated text |
| `cancel prompt` | Aborts the current recording |
| `new paragraph` | Inserts a line break |
| `got it` | (TTS mode) Acknowledges the response and continues |
| `stop it` | (TTS mode) Stops the current playback |

> **Note:** Many more punctuation and formatting commands are supported (e.g., `insert comma`, `select all`, `undo it`). Toggle the side panel to see the full list.

**Keyboard Shortcuts:**
- `Ctrl+R`: Toggle recording/playback side panel.
- `Enter`: Send prompt (Talk side).
- `Escape`: Stop recording or close the commands panel.

![Voice command side panel](screenshots/stts-voice-commands.png)

## 🛠️ Development & Manual Install

### Install from a local source

**Claude Code:**
```bash
claude plugins marketplace add "$PWD"
claude plugin install stts
```

**Gemini CLI:**
```bash
gemini extensions install --consent "$PWD"
```

### Daemon Control
The daemon usually runs automatically, but you can manually stop it by closing the Chrome window or:
```bash
curl -X POST http://127.0.0.1:15986/api/shutdown
```

## 📋 Requirements

- **Node.js:** v18 or higher.
- **Chrome/Chromium:** Must be installed and discoverable.
- **Microphone:** Required for STT functionality.

## 📄 License

MIT — [Sandip Chitale](https://github.com/sandipchitale)
