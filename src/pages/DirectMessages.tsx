import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import ConversationList from '@/components/ConversationList';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

interface RecipientProfile {
  id: string;
  username: string;
  avatar_url: string;
}

const DirectMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipient, setRecipient] = useState<RecipientProfile | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipientProfile[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        created_at,
        content,
        sender_id,
        profiles(username, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } else {
      setMessages(data as Message[]);
    }
    setLoadingMessages(false);
  }, [toast]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);

      const channel = supabase
        .channel(`messages_channel_${selectedConversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          // Fetch sender profile for the new message
          supabase.from('profiles').select('username, avatar_url').eq('id', newMessage.sender_id).single()
            .then(({ data: profileData, error: profileError }) => {
              if (profileError) {
                console.error('Error fetching profile for new message:', profileError.message);
              } else if (profileData) {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { ...newMessage, profiles: profileData as { username: string; avatar_url: string } },
                ]);
              }
            });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, fetchMessages]);

  const handleSelectConversation = (convId: string, selectedRecipient: RecipientProfile) => {
    setSelectedConversationId(convId);
    setRecipient(selectedRecipient);
    setShowSearchResults(false); // Hide search results when a conversation is selected
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedConversationId) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversationId,
      sender_id: user.id,
      content,
    });

    if (error) {
      console.error('Error sending message:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(5);

      if (error) {
        console.error('Error searching users:', error.message);
      } else {
        setSearchResults(data as RecipientProfile[]);
        setShowSearchResults(true);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleStartNewConversation = async (recipientId: string, recipientUsername: string, recipientAvatar: string) => {
    if (!user) return;

    // Check if conversation already exists
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1.eq.${user.id},participant2.eq.${recipientId}),and(participant1.eq.${recipientId},participant2.eq.${user.id})`)
      .single();

    if (convError && convError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing conversation:', convError.message);
      toast({
        title: 'Error',
        description: 'Failed to start conversation.',
        variant: 'destructive',
      });
      return;
    }

    let conversationId = existingConv?.id;

    if (!conversationId) {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase.from('conversations').insert({
        participant1: user.id,
        participant2: recipientId,
      }).select('id').single();

      if (createError) {
        console.error('Error creating new conversation:', createError.message);
        toast({
          title: 'Error',
          description: 'Failed to create new conversation.',
          variant: 'destructive',
        });
        return;
      }
      conversationId = newConv?.id;
    }

    if (conversationId) {
      handleSelectConversation(conversationId, { id: recipientId, username: recipientUsername, avatar_url: recipientAvatar });
      setSearchQuery(''); // Clear search query
      setSearchResults([]); // Clear search results
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col lg:flex-row container mx-auto p-4">
        {/* Conversation List / Search Sidebar */}
        <Card className="bg-gray-800/50 border-gray-700 lg:w-1/3 xl:w-1/4 flex flex-col mr-4 mb-4 lg:mb-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-400" /> Direct Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="p-4 border-b border-gray-700 relative">
              <Input
                type="text"
                placeholder="Search users to start a chat..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center p-3 hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleStartNewConversation(profile.id, profile.username, profile.avatar_url)}
                    >
                      <Avatar className="w-8 h-8 mr-3">
                        <AvatarImage src={profile.avatar_url || '/placeholder.svg'} />
                        <AvatarFallback>{profile.username ? profile.username[0].toUpperCase() : '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-white">{profile.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ConversationList onSelectConversation={handleSelectConversation} />
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="bg-gray-800/50 border-gray-700 flex-1 flex flex-col">
          {selectedConversationId && recipient ? (
            <>
              <CardHeader className="pb-3 border-b border-gray-700 flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSelectedConversationId(null)}>
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </Button>
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src={recipient.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback>{recipient.username ? recipient.username[0].toUpperCase() : '?'}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white">{recipient.username}</CardTitle>
                </div>
              </CardHeader>
              <MessageList conversationId={selectedConversationId} messages={messages} />
              <MessageInput onSendMessage={handleSendMessage} disabled={loadingMessages} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
              Select a conversation or search for a user to start a chat.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DirectMessages;


