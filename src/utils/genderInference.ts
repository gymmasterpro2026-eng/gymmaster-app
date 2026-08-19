export const inferGenderFromName = (name: string): 'male' | 'female' => {
  if (!name) return 'male';
  
  const lower = name.trim().toLowerCase();
  
  // Lista de nombres femeninos comunes que no necesariamente terminan en 'a'
  const femaleNames = [
    'vero', 'veronica', 'carmen', 'ines', 'isabel', 'beatriz', 'luz', 
    'pilar', 'dolores', 'rosario', 'mercedes', 'sol', 'mar', 'paz'
  ];

  // Lista de nombres masculinos comunes que terminan en 'a'
  const maleNamesEndsWithA = [
    'luca', 'andrea', 'borja', 'bautista', 'joshua'
  ];

  if (femaleNames.some(fn => lower.includes(fn))) return 'female';
  if (maleNamesEndsWithA.some(mn => lower.includes(mn))) return 'male';
  
  // Si termina en 'a', estadísticamente en español es muy probable que sea mujer
  const firstName = lower.split(' ')[0];
  if (firstName && firstName.endsWith('a')) return 'female';

  return 'male';
};
