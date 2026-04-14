---
name: stts
description: User speaks the prompt, which is sent to the Model, the received response is spoken/read aloud in a loop.
---

Call stt tool, get the response, if the response is empty, output 'Done.' and stop. If not send the response as a prompt to the model. Get the response from the model and send it to the tts tool. Do this in a loop.
