-- Create badge system tables
CREATE TYPE public.badge_type AS ENUM ('admin', 'verified');

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type badge_type NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active badges" 
ON public.user_badges 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage badges" 
ON public.user_badges 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create private rooms table
CREATE TABLE public.private_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎧',
  host_id UUID NOT NULL,
  participant_ids UUID[] DEFAULT '{}',
  max_participants INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on private rooms
ALTER TABLE public.private_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for private rooms
CREATE POLICY "Users can view active rooms they're part of" 
ON public.private_rooms 
FOR SELECT 
USING (
  is_active = true AND 
  expires_at > now() AND
  (host_id = auth.uid() OR auth.uid() = ANY(participant_ids))
);

CREATE POLICY "Verified users can create rooms" 
ON public.private_rooms 
FOR INSERT 
WITH CHECK (
  auth.uid() = host_id AND
  EXISTS (
    SELECT 1 FROM public.user_badges 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create DM conversations table
CREATE TABLE public.dm_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Enable RLS on DM conversations
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for DM conversations (only verified users)
CREATE POLICY "Only verified users can access DMs" 
ON public.dm_conversations 
FOR ALL 
USING (
  (auth.uid() = participant_1 OR auth.uid() = participant_2) AND
  EXISTS (
    SELECT 1 FROM public.user_badges 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'verification', 'room_join'
  amount_zar DECIMAL(10,2) NOT NULL,
  africas_talking_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  room_id UUID, -- for room join payments
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for payment transactions
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);