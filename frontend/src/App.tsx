import React, { useEffect, useRef, useState } from 'react';
import './App.css';

enum MessageType {
  Acknowledge = 'ACKNOWLEDGE',
  Content = 'CONTENT',
  Ping = 'PING',
}

interface Message {
  type: MessageType;
  content: string;
}

function App() {
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const wsRef = useRef<WebSocket>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = window.location.origin.replace(/^http/, 'ws');
    wsRef.current = new WebSocket(host);
    wsRef.current.onopen = (ev) => {
      console.log('websocket connection opened');
    };
    wsRef.current.onclose = (ev) => {
      console.log('websocket connection closed');
    };
    wsRef.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data) as Message;
      switch (message.type) {
        case MessageType.Acknowledge:
          setSubmitting(false);
          bottomRef.current?.scrollIntoView(true);
          setMessageContent('');
          break;
        case MessageType.Content:
          setMessages((prev) => [...prev, message.content]);
          break;
      }
    };
    wsRef.current.onerror = (ev) => {
      console.error('websocket connection error');
      console.error(ev);
    };
    return () => {
      wsRef.current?.close();
    };
  }, []);

  function handleSubmit() {
    const message = {
      type: MessageType.Content,
      content: messageContent,
    } as Message;
    wsRef.current?.send(JSON.stringify(message));
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4"></div>
        <div className="col p-3 vh-100 d-flex flex-column">
          <h1 className="text-center mb-3">Hanashi</h1>
          <div className="flex-grow-1 overflow-auto d-flex flex-column">
            {messages.map((message, index) => (
              <div key={index} className="card mb-3 p-2">
                <span>{message}</span>
              </div>
            ))}
            <div className="flex-grow-1"></div>
            <div ref={bottomRef}></div>
          </div>
          <div style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
            <form
              onSubmit={(event) => {
                setSubmitting(true);
                handleSubmit();
                event.preventDefault();
              }}
            >
              <input
                type="text"
                className="form-control shadow-none"
                value={messageContent}
                onChange={(event) => setMessageContent(event.target.value)}
                placeholder="Send a message!"
                disabled={submitting}
                autoFocus
              />
            </form>
          </div>
        </div>
        <div className="col-md-4"></div>
      </div>
    </div>
  );
}

export default App;
