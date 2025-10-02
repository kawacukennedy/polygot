import React, { useState, useEffect, useRef } from 'react';
import useTranslation from '../hooks/useTranslation';

interface ChatWidgetProps {
  session_id: string;
  user_id: string;
  onSend: (message: string) => void;
}

interface Message {
  id: string;
  sender: string;
  text: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ session_id, user_id, onSend }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate receiving messages
  useEffect(() => {
    // This would be replaced by actual WebSocket logic
    const timer = setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), sender: 'System', text: t('welcome_to_chat') },
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = { id: Date.now().toString(), sender: user_id, text: input.trim() };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-2" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 rounded-lg ${msg.sender === user_id ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}>
            <span className="font-bold">{msg.sender}: </span>{msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4 flex items-center">
        <textarea
          className="flex-1 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={t('message')} 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={t('message_input')}
          rows={1}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          aria-label={t('send_message')}
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;