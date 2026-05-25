---
name: stts
description: User speaks the prompt, which is sent to the Model, the received response is spoken/read aloud in a loop.
---

Call the stt MCP tool and read its response. If the response is empty, output 'Done.' and stop. Otherwise, treat the response as a prompt and answer it. Pass that answer to the tts MCP tool. Repeat in a loop. While the loop is running, do not output anything else to the user.
