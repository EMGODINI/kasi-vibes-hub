import React, { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface MessageListProps {
  conversationId: string;
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ conversationId, messages }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, payload => {
        // This component receives messages via props, so no need to update state here.
        // The parent component (DirectMessages.tsx) will handle fetching and passing new messages.
        console.log('New message received via realtime:', payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          {message.sender_id !== user?.id && (
            <Avatar className="w-8 h-8 mr-3">
              <AvatarImage src={message.profiles?.avatar_url || '/placeholder.svg'} />
              <AvatarFallback>{message.profiles?.username ? message.profiles.username[0].toUpperCase() : '?'}</AvatarFallback>
            </Avatar>
          )}
          <div
            className={`max-w-[70%] p-3 rounded-lg ${message.sender_id === user?.id
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-700 text-gray-100 rounded-bl-none'}
            `}
          >
            <p className="text-sm font-medium">{message.profiles?.username || 'Unknown User'}</p>
            <p className="text-base">{message.content}</p>
            <span className="text-xs opacity-75 mt-1 block">
              {format(new Date(message.created_at), 'MMM d, hh:mm a')}
            </span>
          </div>
          {message.sender_id === user?.id && (
            <Avatar className="w-8 h-8 ml-3">
              <AvatarImage src={message.profiles?.avatar_url || '/placeholder.svg'} />
              <AvatarFallback>{message.profiles?.username ? message.profiles.username[0].toUpperCase() : '?'}</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;


