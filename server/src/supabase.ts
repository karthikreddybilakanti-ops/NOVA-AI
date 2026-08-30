import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable lookup supporting standard naming conventions
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase client initialized successfully with URL:', supabaseUrl.slice(0, 20) + '...');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err);
  }
} else {
  console.log('ℹ️ Supabase environment variables not configured. Operating in high-performance local/in-memory store mode.');
}

export const supabase = supabaseClient;

/**
 * Helper to upload files to Supabase Storage if configured
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) {
    return { url: null, error: 'Supabase client not configured' };
  }

  try {
    const filePath = `uploads/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload error to bucket "${bucketName}":`, error.message);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('[Supabase Storage Exception]:', err.message);
    return { url: null, error: err.message };
  }
}
