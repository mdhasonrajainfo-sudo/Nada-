
import { createClient } from '@supabase/supabase-js';

const PROJECT_URL = 'https://rvsgcrwcjpftzpdjjxbf.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_NopuUASlXBJnIjHfgA-_Mg__PK4uN37';

export const supabase = createClient(PROJECT_URL, PUBLISHABLE_KEY);
