import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://samgpnczlznynnfhjjff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbWdwbmN6bHpueW5uZmhqamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjU1NjQsImV4cCI6MjA4Nzc0MTU2NH0.AV1Z-QlltfPp8am-_ALlgopoGB8WhOrle83TNZrjqTE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  console.log("Obteniendo alumnos...");
  const { data: alumnos, error: err1 } = await supabase.from('gym_profiles').select('*').eq('role', 'alumno');
  if (err1) {
    console.error("Error obteniendo alumnos:", err1);
    return;
  }
  console.log(`Encontrados ${alumnos.length} alumnos.`);

  if (alumnos.length > 0) {
    const alumnoId = alumnos[0].id;
    console.log(`Intentando borrar alumno: ${alumnoId}`);
    
    const { data, error, status, statusText } = await supabase.from('gym_profiles').delete().eq('id', alumnoId);
    
    console.log("Resultado Supabase DELETE:");
    console.log("Error:", error);
    console.log("Status:", status, statusText);
    console.log("Data:", data);
  }
}

testDelete();
