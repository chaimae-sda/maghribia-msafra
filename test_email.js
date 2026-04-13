import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyiqdruyrwhuxjckjkcs.supabase.co';
const supabaseKey = 'sb_publishable_0rdb-eC12_XspFuXpstn9g_b3Yg0soH';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testResend() {
  const email = 'saadichaimae12@gmail.com';
  console.log(`Testing auth.resend for: ${email}`);
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  });
  
  if (error) {
    console.error('Error from Supabase:', error.message, error.status);
  } else {
    console.log('Success!', data);
  }
}

testResend();
