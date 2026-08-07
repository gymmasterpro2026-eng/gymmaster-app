import fetch from 'node-fetch';

const url = 'https://samgpnczlznynnfhjjff.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbWdwbmN6bHpueW5uZmhqamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjU1NjQsImV4cCI6MjA4Nzc0MTU2NH0.AV1Z-QlltfPp8am-_ALlgopoGB8WhOrle83TNZrjqTE';

async function checkRest() {
  const res = await fetch(`${url}/rest/v1/gym_profiles?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  console.log('Status code for gym_profiles:', res.status);
  const body = await res.text();
  console.log('Response body:', body);
}

checkRest();
