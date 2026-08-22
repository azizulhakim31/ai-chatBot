import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Copy,
  Menu,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  User,
  X
} from "lucide-react";

const STORAGE_KEY = "nova-chat-history";

const suggestions = [
  "Explain how the internet works",
  "Create a React login form",
  "What is the difference between SQL and NoSQL?",
  "Give me a roadmap to learn DevOps"
];

function App() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    const value = text.trim();
    if (!value || loading) return;

    const userMessage = { role: "user", text: value };
    const history = messages.map(({ role, text }) => ({ role, text }));

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages(prev => [
        ...prev,
        { role: "model", text: data.reply }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: `Sorry, something went wrong.\n\n${error.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
  };

  const clearChat = () => {
    if (confirm("Clear this conversation?")) {
      newChat();
    }
  };

  const copyMessage = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 p-4 transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <Sparkles size={19} />
            </div>
            <div>
              <h1 className="font-semibold">Nova AI</h1>
              <p className="text-xs text-slate-500">Gemini powered</p>
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <button
          onClick={newChat}
          className="mb-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium hover:bg-slate-800"
        >
          <MessageSquarePlus size={18} />
          New chat
        </button>

        <div className="flex-1">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current chat
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm text-slate-300">
            <MessageSquarePlus size={16} />
            <span className="truncate">
              {messages[0]?.text || "New conversation"}
            </span>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={17} />
          Clear conversation
        </button>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="glass flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-slate-800 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-semibold">AI Assistant</h2>
              <p className="text-xs text-slate-500">Ask anything</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
            {messages.length === 0 ? (
              <div className="flex min-h-[calc(100vh-190px)] flex-col items-center justify-center text-center">
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  <Bot size={32} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  How can I help?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Ask questions, write code, learn concepts, brainstorm ideas,
                  or get help with everyday tasks.
                </p>

                <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                  {suggestions.map(item => (
                    <button
                      key={item}
                      onClick={() => sendMessage(item)}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-left text-sm text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-7">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "model" && (
                      <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-400">
                        <Bot size={17} />
                      </div>
                    )}

                    <div
                      className={`group max-w-[85%] ${
                        message.role === "user"
                          ? "rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3"
                          : "min-w-0"
                      }`}
                    >
                      <div className="message-content text-sm leading-7 text-slate-200">
                        {message.text}
                      </div>

                      {message.role === "model" && (
                        <button
                          onClick={() => copyMessage(message.text, index)}
                          className="mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                        >
                          <Copy size={13} />
                          {copied === index ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-slate-400">
                        <User size={17} />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-400">
                      <Bot size={17} />
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </section>

        <div className="border-t border-slate-800 bg-slate-950/95 p-3 md:p-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            className="mx-auto max-w-4xl"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/20 focus-within:border-slate-600">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Message Nova..."
                className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-600">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;