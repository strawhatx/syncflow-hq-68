import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get n8n credentials from Supabase secrets
const n8nUsername = Deno.env.get('8N8_USERNAME');
const n8nPassword = Deno.env.get('8N8_PASSWORD');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        let result = [];
        const { connection, provider } = await req.json();

        if (!connection || !provider) {
            return new Response(
                JSON.stringify({ error: 'Project ID is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        try {
            if (!n8nUsername || !n8nPassword) {
                console.error('n8n credentials not found in environment variables');
                throw new Error('n8n credentials not configured');
            }

            // Make request to n8n webhook using POST with project_id in body
            const api = 'https://primary-production-146e9.up.railway.app/webhook/get-tables';
            const credentials = btoa(`${n8nUsername}:${n8nPassword}`);
            const webhookResponse = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${credentials}`
                },
                body: JSON.stringify({
                    connection,
                    provider
                })
            });

            if (webhookResponse.ok) {
                const webhookData = await webhookResponse.json();
                console.log('n8n webhook response data:', JSON.stringify(webhookData, null, 2));

                // Ensure we have the expected structure
                result = webhookData
            } 
            else {
                const errorText = await webhookResponse.text();
                console.warn('n8n webhook request failed with status:', webhookResponse.status, 'Error:', errorText);
                result = []
            }
        } catch (error) {
            console.error('Error calling n8n webhook:', error);
        }


        console.log('GitHub data retrieved successfully');

        return new Response(
            JSON.stringify({ data: result }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error in fetch-github-data function:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});