-- Remove overly permissive policy (service role already bypasses RLS)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;