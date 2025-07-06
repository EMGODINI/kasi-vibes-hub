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

    const { type, userId, phoneNumber, roomId } = await req.json()
    console.log('Payment request:', { type, userId, phoneNumber, roomId })

    // Validate request
    if (!type || !userId || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amount = type === 'verification' ? 10 : 5 // R10 for verification, R5 for room join
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY')
    
    if (!apiKey) {
      console.error('Africa\'s Talking API key not found')
      return new Response(
        JSON.stringify({ error: 'Payment service unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        transaction_type: type,
        amount_zar: amount,
        room_id: roomId,
        status: 'pending'
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initiate Africa's Talking payment
    const username = 'sandbox' // Use 'sandbox' for testing
    const productName = 'YourApp' // Replace with your actual product name
    
    const paymentData = {
      username,
      productName,
      phoneNumber,
      currencyCode: 'ZAR',
      amount: amount,
      metadata: {
        transactionId: transaction.id,
        type,
        userId
      }
    }

    console.log('Initiating payment with Africa\'s Talking:', paymentData)

    const response = await fetch('https://payments.sandbox.africastalking.com/mobile/checkout/request', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'apiKey': apiKey,
      },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()
    console.log('Africa\'s Talking response:', result)

    if (result.status === 'PendingConfirmation') {
      // Update transaction with Africa's Talking transaction ID
      await supabase
        .from('payment_transactions')
        .update({ 
          africas_talking_transaction_id: result.transactionId,
          status: 'pending'
        })
        .eq('id', transaction.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment initiated. Please confirm on your phone.',
          transactionId: transaction.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Payment failed
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)

      return new Response(
        JSON.stringify({ 
          error: 'Payment failed',
          details: result 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Payment handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})