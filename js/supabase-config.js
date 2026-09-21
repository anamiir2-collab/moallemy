/* Supabase configuration for مُعلّمي */

(function () {
  const SUPABASE_URL = 'https://kzxajoxdqcefczdvwapk.supabase.co';

  const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_DFSkgxUvXe-bpnwgGu6dbQ_6mnrdNzl';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS لم يتم تحميله');
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
})();