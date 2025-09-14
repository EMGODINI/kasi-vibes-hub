import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Payment callback received:', body)

    const { status, transactionId, requestMetadata } = body

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the transaction by Africa's Talking transaction ID
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('africas_talking_transaction_id', transactionId)
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction not found:', transactionError)
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (status === 'Success') {
      // Update transaction status
      await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      if (transaction.transaction_type === 'verification') {
        // Grant verified badge
        await supabase
          .from('user_badges')
          .insert({
            user_id: transaction.user_id,
            badge_type: 'verified'
          })

        console.log('Verified badge granted to user:', transaction.user_id)
      } else if (transaction.transaction_type === 'room_join' && transaction.room_id) {
        // Add user to room participants
        const { data: room } = await supabase
          .from('private_rooms')
          .select('participant_ids')
          .eq('id', transaction.room_id)
          .single()

        if (room) {
          const updatedParticipants = [...(room.participant_ids || []), transaction.user_id]
          await supabase
            .from('private_rooms')
            .update({ participant_ids: updatedParticipants })
            .eq('id', transaction.room_id)

          console.log('User added to room:', transaction.room_id)
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment processed successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Payment failed
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)

      console.log('Payment failed for transaction:', transaction.id)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Payment failed processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Payment callback error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})