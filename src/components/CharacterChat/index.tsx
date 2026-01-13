// Character Chat - AI-powered conversation with character
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CharacterType, SkillNode, GameSession, CHARACTERS } from '../../types';
import { geminiService } from '../../services/gemini';

interface CharacterChatProps {
  characterType: CharacterType;
  playerName: string;
  nodes: SkillNode[];
  sessions: GameSession[];
  onExit: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CharacterChat: React.FC<CharacterChatProps> = ({
  characterType,
  playerName,
  nodes,
  sessions,
  onExit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const character = CHARACTERS[characterType];

  // Initial greeting
  useEffect(() => {
    const greeting = async () => {
      const response = await geminiService.generateResponse(
        `Say hello to ${playerName} who just opened the chat!`,
        characterType as any,
        { playerName, nodes, sessions }
      );
      
      setMessages([{
        id: '1',
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }]);
    };
    greeting();
  }, [characterType, playerName, nodes, sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(
        input.trim(),
        characterType as any,
        { playerName, nodes, sessions }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What should I practice?",
    "Tell me a fun fact!",
    "How am I doing?",
    "Give me a word challenge!",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-lg">
        <button
          onClick={onExit}
          className="p-2 rounded-full bg-white/20 text-white"
        >
          ←
        </button>
        
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: character.color }}
        >
          {characterType === 'brio' && '🦁'}
          {characterType === 'vowelia' && '🦉'}
          {characterType === 'diesel' && '🦊'}
          {characterType === 'zippy' && '🐰'}
        </motion.div>
        
        <div>
          <p className="text-white font-bold">{character.name}</p>
          <p className="text-white/60 text-xs">Your learning buddy</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-white text-gray-800 rounded-br-sm'
                  : 'bg-white/20 text-white rounded-bl-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/20 p-4 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt)}
              className="whitespace-nowrap bg-white/20 text-white text-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white/10 backdrop-blur-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask ${character.name} anything...`}
            className="flex-1 px-4 py-3 rounded-full bg-white text-gray-800 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterChat;
