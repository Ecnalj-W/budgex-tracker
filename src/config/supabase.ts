export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://iyrgghswrlyvcvynphlf.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_30QoJHhWflMNZLoFIP49zQ_vS5ZPMCu',
  redirectScheme: 'budgex',
  profilesTable: 'profiles',
  transactionsTable: 'transactions',
};
