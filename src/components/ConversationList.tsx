import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participant1: string;
  participant2: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string;
  }[];
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string, recipient: { id: string; username: string; avatar_url: string }) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            updated_at,
            participant1,
            participant2,
            profiles!participant1_fkey(id, username, avatar_url),
            profiles!participant2_fkey(id, username, avatar_url)
          `)
          .or(`participant1.eq.${user.id},participant2.eq.${user.id}`);

        if (error) {
          throw error;
        }

        const formattedConversations = data.map((conv: any) => {
          const otherParticipant = conv.profiles[0].id === user.id ? conv.profiles[1] : conv.profiles[0];
          return {
            ...conv,
            profiles: [otherParticipant] // Simplify to just the other participant
          };
        });

        setConversations(formattedConversations);
      } catch (err: any) {
        console.error('Error fetching conversations:', err.message);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Realtime listener for new conversations or updates
    const channel = supabase
      .channel('conversations_list')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public', 
        table: 'conversations',
        filter: `participant1=eq.${user?.id}`
      }, payload => {
        console.log('Change received!', payload);
        fetchConversations(); // Re-fetch conversations on any change
      })
      .on('postgres_changes', {
        event: '*', 
        schema: 'public', 
        table: 'conversations',
        filter: `participant2=eq.${user?.id}`
      }, payload => {
        console.log('Change received!', payload);
        fetchConversations(); // Re-fetch conversations on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <div className="text-center text-gray-400">Loading conversations...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-white">Your Conversations</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto custom-scrollbar p-0">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-400 p-4">No conversations yet. Start a new chat!</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {conversations.map((conv) => {
              const recipient = conv.profiles[0];
              return (
                <li 
                  key={conv.id} 
                  className="flex items-center p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => onSelectConversation(conv.id, recipient)}
                >
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={recipient.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback>{recipient.username ? recipient.username[0].toUpperCase() : '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-white">{recipient.username}</h4>
                    <p className="text-sm text-gray-400">Last message: {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;


