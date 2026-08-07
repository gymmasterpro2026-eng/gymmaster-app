import fetch from 'node-fetch';

const url = 'https://samgpnczlznynnfhjjff.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbWdwbmN6bHpueW5uZmhqamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjU1NjQsImV4cCI6MjA4Nzc0MTU2NH0.AV1Z-QlltfPp8am-_ALlgopoGB8WhOrle83TNZrjqTE';

async function testTables() {
  const tables = ['gym_tenants', 'gym_profiles', 'gym_routines', 'gym_routine_logs', 'gym_exercises'];
  
  for (const table of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      console.log(`Table ${table}: Status ${res.status}`);
      if (res.status === 200) {
        const data = await res.json();
        console.log(`   Data count: ${data.length}`);
      }
    } catch (e) {
      console.error(`Error testing ${table}:`, e);
    }
  }
}

testTables();
