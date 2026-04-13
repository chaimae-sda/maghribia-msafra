-- ================================================
-- AGENCY BILLING & FINANCIALS SETUP
-- ================================================

-- 1. Table to track monthly platform payments from agencies
CREATE TABLE IF NOT EXISTS public.agency_platform_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    month TEXT NOT NULL, -- Format: YYYY-MM
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_url TEXT, -- URL to the uploaded receipt image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies
ALTER TABLE public.agency_platform_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view their own payments" 
ON public.agency_platform_payments FOR SELECT 
USING (auth.uid() = agency_id);

CREATE POLICY "Agencies can submit payments" 
ON public.agency_platform_payments FOR INSERT 
WITH CHECK (auth.uid() = agency_id);

CREATE POLICY "Admin can manage all agency payments" 
ON public.agency_platform_payments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3. Add fields to track platform earnings in a simple way
-- We can calculate this on the fly, but let's ensure bookings and trips are correct.
-- (Trips already have price, Bookings are connected).

-- 4. Seed some payments for testing (Replace with current agency IDs)
-- INSERT INTO public.agency_platform_payments (agency_id, amount, month, status)
-- VALUES ('...', 450.00, '2026-03', 'approved');
