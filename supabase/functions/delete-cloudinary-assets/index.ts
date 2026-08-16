// Supabase Edge Function: delete-cloudinary-assets
// Handles secure deletion of Cloudinary assets using administrative secrets
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify Authentication & Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header.' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Edge Function Error: Supabase URL or Anon Key is missing from environment.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with the user's authorization header
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify token validity
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token.' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is authorized as an administrator using existing Phase 6A mechanism
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError || !isAdmin) {
      console.warn(`Unauthorized access attempt by: ${user.email}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Administrator rights required.' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request payload containing Cloudinary public IDs
    const { public_ids } = await req.json();
    if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid public_ids parameter.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Load administrative credentials from environment
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Edge Function Error: Cloudinary credentials missing from environment.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Dispatch deletion requests to Cloudinary API
    const deletionResults = [];
    let hasFailure = false;
    let failureReason = '';
    
    for (const publicId of public_ids) {
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // Generate SHA-1 signature: sha1("public_id={publicId}&timestamp={timestamp}{apiSecret}")
      const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signaturePayload);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Call Cloudinary secure destroy endpoint
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        hasFailure = true;
        const errText = await response.text();
        failureReason = `Cloudinary returned status ${response.status}: ${errText}`;
        deletionResults.push({ public_id: publicId, status: 'failed', error: failureReason });
        continue;
      }

      const result = await response.json();
      if (result.error) {
        hasFailure = true;
        failureReason = result.error.message;
        deletionResults.push({ public_id: publicId, status: 'failed', error: result.error.message });
      } else {
        deletionResults.push({ 
          public_id: publicId, 
          status: result.result === 'ok' ? 'deleted' : result.result 
        });
        if (result.result !== 'ok' && result.result !== 'not found') {
          hasFailure = true;
          failureReason = `Deletion status: ${result.result}`;
        }
      }
    }

    if (hasFailure) {
      return new Response(
        JSON.stringify({ error: `Cloudinary cleanup failed: ${failureReason}`, results: deletionResults }), 
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Deletion processing completed.', results: deletionResults }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error inside Edge Function:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
