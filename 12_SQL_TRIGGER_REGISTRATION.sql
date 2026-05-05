-- =========================================================================
-- UPDATE AUTH TRIGGER TO SUPPORT ARTISANS REGISTRATION
-- =========================================================================
-- This script replaces the handle_new_user function to insert into the 
-- artisans table if the user role is 'artisan'.

-- Drop existing trigger to avoid collision
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $function$
DECLARE
  v_role TEXT;
  v_phone TEXT;
  v_city TEXT;
  v_business_name TEXT;
  v_description TEXT;
BEGIN
  -- Extract Metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  v_phone := NEW.raw_user_meta_data->>'phone';
  v_city := NEW.raw_user_meta_data->>'city';
  
  -- 1. Insert into profiles (common for everyone)
  INSERT INTO public.profiles (id, full_name, role, phone, city)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    v_role,
    v_phone,
    v_city
  );

  -- 2. Insert into artisans if role is artisan
  IF v_role = 'artisan' THEN
    v_business_name := NEW.raw_user_meta_data->>'business_name';
    v_description := NEW.raw_user_meta_data->>'description';
    
    INSERT INTO public.artisans (id, business_name, bio)
    VALUES (
      NEW.id,
      v_business_name,
      v_description
    );
    
    -- NOTE: Category linkage should ideally be handled via an RPC or Edge Function 
    -- post-registration if we need to insert into artisan_subcategories.
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebind the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ALTER PROFILES to Ensure Phone/City exist (if not already there)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
