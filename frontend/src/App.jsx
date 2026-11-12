import { useRef, useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import useChat from './hooks/useChat';

export default function App() {
  const { messages, busy, error, setError, send, regenerate, stop, newChat } = useChat();
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!input.trim() || busy) return;
    send(input);
    setInput('');
  };

  // suggestion cards fill the box so the user can tweak the prompt before sending
  const handlePick = (prompt) => {
    setInput(prompt);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) { el.focus(); el.setSelectionRange(prompt.length, prompt.length); }
    });
  };

  const handleNewChat = () => {
    newChat();
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <Header onNewChat={handleNewChat} canReset={messages.length > 0} />
      <ChatWindow
        messages={messages} busy={busy} error={error}
        onDismissError={() => setError('')} onRetry={regenerate} onPick={handlePick} onRegenerate={regenerate}
      />
      <ChatInput value={input} onChange={setInput} onSend={handleSend} onStop={stop} busy={busy} inputRef={inputRef} />
    </div>
  );
}
