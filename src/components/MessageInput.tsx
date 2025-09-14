import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [messageContent, setMessageContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim() && !disabled) {
      onSendMessage(messageContent);
      setMessageContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-700 bg-gray-800">
      <Input
        type="text"
        placeholder="Type your message..."
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        className="flex-1 mr-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled} className="bg-blue-600 hover:bg-blue-700 text-white">
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
};

export default MessageInput;


