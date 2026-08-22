# Nova AI: Full-Stack Gemini Chatbot

Nova AI is a full-stack chatbot with a React frontend, Tailwind CSS styling, and an Express backend powered by Google's Gemini API.

## Features

- Streaming-style chat interface with suggested prompts
- Markdown rendering for assistant responses, including code blocks, lists, and links
- Conversation history stored in browser `localStorage`
- Copy response and clear conversation actions
- Responsive layout with a mobile sidebar
- Customizable system prompt

## Tech stack

- Frontend: React, Vite, Tailwind CSS, `react-markdown`
- Backend: Node.js and Express
- AI: Google Gemini API through `@google/genai`

## Prerequisites

- Node.js 18 or newer
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

1. Clone the repository and open its root directory.
2. Create `server/.env` with the following values:

```dotenv
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-3.6-flash
PORT=5000
```

Keep the API key in the server environment. Do not add it to the React frontend or commit it to source control.

3. Install dependencies:

From the project root:

```bash
npm install
npm run install-all
```

## Development

Start both the Express server and Vite development server from the project root:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite forwards frontend `/api` requests to the backend at `http://localhost:5000`.

You can also start each package separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

## Production build

Build the frontend with:

```bash
npm run build --prefix client
```

Start the backend with:

```bash
npm start
```

## Customize Nova AI

Edit [`server/prompt.js`](server/prompt.js). The `SYSTEM_PROMPT` value controls the assistant's behavior and response style.

## API

### Health check

`GET /api/health`

Example response:

```json
{
  "ok": true,
  "model": "gemini-3.6-flash"
}
```

### Chat

`POST /api/chat`

Request:

```json
{
  "message": "Explain React hooks",
  "history": [
    { "role": "user", "text": "Hello" },
    { "role": "model", "text": "Hi!" }
  ]
}
```

Response:

```json
{
  "reply": "..."
}
```

The server accepts up to the latest 20 valid history messages and returns an error if `GEMINI_API_KEY` is missing or the message is empty.

## License

This project is licensed under the [MIT License](LICENSE).
