import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("Signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    const handleSubscriptionEvent = async (subscription: Stripe.Subscription) => {
      const customerId = subscription.customer as string;
      logStep("Processing subscription", { 
        subscriptionId: subscription.id, 
        customerId, 
        status: subscription.status 
      });

      // Get customer to find email
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        logStep("Customer was deleted, skipping");
        return;
      }

      const email = customer.email;
      if (!email) {
        logStep("Customer has no email, skipping");
        return;
      }

      // Find user by email
      const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
      if (userError) {
        logStep("Error listing users", { error: userError.message });
        throw userError;
      }

      const user = users.users.find(u => u.email === email);
      if (!user) {
        logStep("No user found for email", { email });
        return;
      }

      logStep("Found user", { userId: user.id, email });

      const priceId = subscription.items.data[0]?.price?.id || null;
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      // Upsert subscription
      const { error: upsertError } = await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          price_id: priceId,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });

      if (upsertError) {
        logStep("Upsert error", { error: upsertError.message });
        throw upsertError;
      }

      logStep("Subscription upserted successfully", { 
        userId: user.id, 
        status: subscription.status,
        priceId 
      });
    };

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        const deletedSub = event.data.object as Stripe.Subscription;
        const customerId = deletedSub.customer as string;
        
        logStep("Subscription deleted", { subscriptionId: deletedSub.id, customerId });

        // Update status to canceled
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update({ 
            status: "canceled",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_subscription_id", deletedSub.id);

        if (updateError) {
          logStep("Update error on deletion", { error: updateError.message });
        } else {
          logStep("Subscription marked as canceled");
        }
        break;

      case "invoice.payment_failed":
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
        
        if (invoice.subscription) {
          const { error } = await supabaseClient
            .from("subscriptions")
            .update({ 
              status: "past_due",
              updated_at: new Date().toISOString()
            })
            .eq("stripe_subscription_id", invoice.subscription as string);
          
          if (error) {
            logStep("Update error on payment failed", { error: error.message });
          }
        }
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
