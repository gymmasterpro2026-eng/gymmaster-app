import React, { useState } from 'react';
import { Apple, Activity, Scale, Ruler, Calendar, Check, Save, ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const DietPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'diet'>('calculator');

  // Estado del Formulario
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(80);
  const [height, setHeight] = useState<number>(180);
  const [wrist, setWrist] = useState<number>(18);
  const [activityLevel, setActivityLevel] = useState<number>(1.2);

  // Resultados
  const [frameSize, setFrameSize] = useState<string>('');
  const [ibw, setIbw] = useState<number>(0);
  const [bmr, setBmr] = useState<number>(0);
  const [tdee, setTdee] = useState<number>(0);
  const [calculated, setCalculated] = useState<boolean>(false);

  // Estado de la Dieta
  const [deficit, setDeficit] = useState<number>(500); 
  const [duration, setDuration] = useState<number>(7);
  const [constipation, setConstipation] = useState<boolean>(false);
  const [gutFlora, setGutFlora] = useState<boolean>(false);
  
  // Persianas y Alimentos seleccionados
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [openPanel, setOpenPanel] = useState<number | null>(null);

  const [generatedDiet, setGeneratedDiet] = useState<any>(null);

  // Base de datos de alimentos Global (con Categorías)
  const foodCategories = [
    {
      id: 0,
      title: 'Comidas Rápidas & Complejas',
      items: [
        { name: 'Pizza Margarita (Queso)', cat: 'complejo', kcal: 266, p: 11.4, c: 33.3, f: 9.7 },
        { name: 'Pizza de Pepperoni', cat: 'complejo', kcal: 298, p: 12, c: 34, f: 12 },
        { name: 'Lasaña de carne magra', cat: 'complejo', kcal: 185, p: 10.8, c: 11.4, f: 10.7 },
        { name: 'Hamburguesa de res', cat: 'complejo', kcal: 295, p: 17, c: 24, f: 14 },
        { name: 'Hamburguesa de pollo', cat: 'complejo', kcal: 280, p: 15, c: 25, f: 11 },
        { name: 'Milanesa de pollo al horno', cat: 'complejo', kcal: 220, p: 18, c: 15, f: 9 },
        { name: 'Milanesa de carne frita', cat: 'complejo', kcal: 290, p: 15, c: 18, f: 15 },
        { name: 'Tacos de res', cat: 'complejo', kcal: 220, p: 12, c: 20, f: 10 },
        { name: 'Burrito de pollo', cat: 'complejo', kcal: 200, p: 10, c: 22, f: 8 },
        { name: 'Sushi (Rolls de salmón)', cat: 'complejo', kcal: 140, p: 5, c: 28, f: 1 },
        { name: 'Empanada de carne al horno', cat: 'complejo', kcal: 260, p: 10, c: 25, f: 12 },
        { name: 'Hot Dog / Pancho', cat: 'complejo', kcal: 290, p: 10, c: 18, f: 19 },
        { name: 'Macarrones con queso', cat: 'complejo', kcal: 310, p: 12, c: 35, f: 14 },
        { name: 'Shawarma de carne', cat: 'complejo', kcal: 250, p: 13, c: 25, f: 10 },
        { name: 'Caldo de pollo/pescado', cat: 'complejo', kcal: 95, p: 12, c: 4, f: 3 }
      ]
    },
    {
      id: 1,
      title: 'Proteínas y Carnes',
      items: [
        { name: 'Pollo grillé', cat: 'proteina', kcal: 165, p: 31, c: 0.1, f: 3 },
        { name: 'Pollo asado (con piel)', cat: 'proteina', kcal: 195, p: 28, c: 0.1, f: 8 },
        { name: 'Pollo hervido/hervido', cat: 'proteina', kcal: 150, p: 30, c: 0.1, f: 3 },
        { name: 'Pavo asado (pechuga)', cat: 'proteina', kcal: 135, p: 30, c: 0.1, f: 1 },
        { name: 'Pescado blanco (plancha)', cat: 'proteina', kcal: 128, p: 26, c: 0.1, f: 2 },
        { name: 'Salmón a la plancha', cat: 'proteina', kcal: 206, p: 22, c: 0.1, f: 13 },
        { name: 'Asado de res magro', cat: 'proteina', kcal: 250, p: 26, c: 0.1, f: 15 },
        { name: 'Asado de costilla', cat: 'proteina', kcal: 350, p: 18, c: 0.1, f: 30 },
        { name: 'Vacío de res', cat: 'proteina', kcal: 280, p: 20, c: 0.1, f: 22 },
        { name: 'Bife de chorizo / Lomo', cat: 'proteina', kcal: 270, p: 25, c: 0.1, f: 18 },
        { name: 'Cerdo magro (lomo)', cat: 'proteina', kcal: 143, p: 26, c: 0.1, f: 3 },
        { name: 'Chuleta de cerdo', cat: 'proteina', kcal: 230, p: 24, c: 0.1, f: 14 },
        { name: 'Atún al natural', cat: 'proteina', kcal: 116, p: 25, c: 0.1, f: 1 },
        { name: 'Atún en aceite', cat: 'proteina', kcal: 198, p: 29, c: 0.1, f: 8 },
        { name: 'Huevos revueltos/cocidos', cat: 'proteina', kcal: 155, p: 13, c: 1, f: 11 },
        { name: 'Claras de huevo', cat: 'proteina', kcal: 52, p: 11, c: 1, f: 0.1 },
        { name: 'Queso Cottage', cat: 'proteina', kcal: 98, p: 11, c: 3, f: 4 },
        { name: 'Tofu firme', cat: 'proteina', kcal: 144, p: 16, c: 3, f: 9 },
        { name: 'Camarones / Langostinos', cat: 'proteina', kcal: 99, p: 24, c: 0.1, f: 0.1 }
      ]
    },
    {
      id: 2,
      title: 'Carbohidratos y Legumbres',
      items: [
        { name: 'Arroz blanco cocido', cat: 'carbo', kcal: 130, p: 3, c: 28, f: 0.3 },
        { name: 'Arroz integral cocido', cat: 'carbo', kcal: 111, p: 3, c: 23, f: 1 },
        { name: 'Quinoa cocida', cat: 'carbo', kcal: 120, p: 4, c: 21, f: 2 },
        { name: 'Avena cocida', cat: 'carbo', kcal: 71, p: 2.5, c: 12, f: 1.5 },
        { name: 'Fideos/Pasta integral', cat: 'carbo', kcal: 124, p: 5, c: 25, f: 1 },
        { name: 'Fideos blancos', cat: 'carbo', kcal: 131, p: 5, c: 26, f: 1 },
        { name: 'Papas al horno/hervidas', cat: 'carbo', kcal: 86, p: 1.7, c: 20, f: 0.1 },
        { name: 'Puré de papas', cat: 'carbo', kcal: 110, p: 2, c: 17, f: 4 },
        { name: 'Batata / Boniato', cat: 'carbo', kcal: 86, p: 2, c: 20, f: 0.1 },
        { name: 'Lentejas cocidas', cat: 'carbo', kcal: 116, p: 9, c: 20, f: 0.4 },
        { name: 'Garbanzos cocidos', cat: 'carbo', kcal: 164, p: 9, c: 27, f: 2.6 },
        { name: 'Frijoles negros cocidos', cat: 'carbo', kcal: 132, p: 9, c: 24, f: 1 }
      ]
    },
    {
      id: 3,
      title: 'Frutas y Hortalizas',
      items: [
        { name: 'Ensalada fresca (Lechuga, Tomate)', cat: 'vegetal', kcal: 20, p: 1, c: 4, f: 0.1 },
        { name: 'Pepino fresco', cat: 'vegetal', kcal: 15, p: 0.7, c: 3.6, f: 0.1 },
        { name: 'Tomate cherry', cat: 'vegetal', kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
        { name: 'Brócoli al vapor', cat: 'vegetal', kcal: 35, p: 2.4, c: 7, f: 0.4 },
        { name: 'Zanahoria rallada', cat: 'vegetal', kcal: 41, p: 0.9, c: 10, f: 0.2 },
        { name: 'Espinaca hervida', cat: 'vegetal', kcal: 23, p: 3, c: 4, f: 0.1 },
        { name: 'Calabaza / Zapallo', cat: 'vegetal', kcal: 26, p: 1, c: 6, f: 0.1 },
        { name: 'Calabacín / Zucchini', cat: 'vegetal', kcal: 17, p: 1.2, c: 3, f: 0.3 },
        { name: 'Berenjena al horno', cat: 'vegetal', kcal: 25, p: 1, c: 6, f: 0.2 },
        { name: 'Champiñones / Hongos', cat: 'vegetal', kcal: 22, p: 3, c: 3, f: 0.3 },
        { name: 'Espárragos al vapor', cat: 'vegetal', kcal: 20, p: 2, c: 4, f: 0.1 },
        { name: 'Coliflor', cat: 'vegetal', kcal: 25, p: 2, c: 5, f: 0.1 },
        { name: 'Aguacate / Palta', cat: 'vegetal', kcal: 160, p: 2, c: 9, f: 15 },
        { name: 'Cebolla y pimientos asados', cat: 'vegetal', kcal: 40, p: 1, c: 9, f: 0.1 },
        { name: 'Plátano/Banana', cat: 'fruta', kcal: 89, p: 1.1, c: 23, f: 0.3 },
        { name: 'Manzana fresca', cat: 'fruta', kcal: 52, p: 0.3, c: 14, f: 0.2 },
        { name: 'Pera', cat: 'fruta', kcal: 57, p: 0.4, c: 15, f: 0.1 },
        { name: 'Naranja', cat: 'fruta', kcal: 47, p: 1, c: 12, f: 0.1 },
        { name: 'Kiwi', cat: 'fruta', kcal: 61, p: 1.1, c: 15, f: 0.5 },
        { name: 'Uvas', cat: 'fruta', kcal: 69, p: 1, c: 18, f: 0.1 },
        { name: 'Frutillas / Fresas', cat: 'fruta', kcal: 32, p: 1, c: 8, f: 0.1 },
        { name: 'Arándanos', cat: 'fruta', kcal: 57, p: 0.7, c: 14, f: 0.3 },
        { name: 'Sandía', cat: 'fruta', kcal: 30, p: 1, c: 8, f: 0.1 },
        { name: 'Melón', cat: 'fruta', kcal: 34, p: 0.8, c: 8, f: 0.2 },
        { name: 'Piña / Ananá', cat: 'fruta', kcal: 50, p: 0.5, c: 13, f: 0.1 },
        { name: 'Mango', cat: 'fruta', kcal: 60, p: 0.8, c: 15, f: 0.4 },
        { name: 'Papaya', cat: 'fruta', kcal: 43, p: 0.5, c: 11, f: 0.3 }
      ]
    },
    {
      id: 4,
      title: 'Lácteos, Bebidas y Snacks',
      items: [
        { name: 'Leche entera', cat: 'lacteo', kcal: 62, p: 3.2, c: 4.8, f: 3.2 },
        { name: 'Leche deslactosada/descremada', cat: 'lacteo', kcal: 43, p: 3.4, c: 5, f: 1 },
        { name: 'Leche de almendras (sin azúcar)', cat: 'lacteo', kcal: 15, p: 0.1, c: 0.1, f: 1 },
        { name: 'Yogur natural sin azúcar', cat: 'lacteo', kcal: 60, p: 4, c: 5, f: 3 },
        { name: 'Yogur griego proteico', cat: 'lacteo', kcal: 90, p: 10, c: 4, f: 4 },
        { name: 'Queso Mozzarella light', cat: 'lacteo', kcal: 254, p: 24, c: 3, f: 16 },
        { name: 'Frutos secos (Almendras/Nueces)', cat: 'snack', kcal: 600, p: 20, c: 20, f: 50 },
        { name: 'Mantequilla de maní', cat: 'snack', kcal: 588, p: 25, c: 20, f: 50 },
        { name: 'Chocolate amargo >70%', cat: 'snack', kcal: 598, p: 8, c: 46, f: 43 },
        { name: 'Barra de proteína', cat: 'snack', kcal: 380, p: 35, c: 30, f: 12 },
        { name: 'Bebida dietética / Zero', cat: 'bebida', kcal: 1, p: 0.1, c: 0.1, f: 0.1 },
        { name: 'Jugo de naranja natural', cat: 'bebida', kcal: 45, p: 1, c: 10, f: 0.1 },
        { name: 'Café / Té sin azúcar', cat: 'bebida', kcal: 2, p: 0.1, c: 0.1, f: 0.1 }
      ]
    },
    {
      id: 5,
      title: 'Panadería y Masas',
      items: [
        { name: 'Pan integral', cat: 'carbo', kcal: 259, p: 13, c: 41, f: 4 },
        { name: 'Pan blanco (molde)', cat: 'carbo', kcal: 265, p: 9, c: 49, f: 3 },
        { name: 'Pan francés / Baguette', cat: 'carbo', kcal: 274, p: 9, c: 52, f: 1.5 },
        { name: 'Pan de salvado', cat: 'carbo', kcal: 247, p: 10, c: 42, f: 3 },
        { name: 'Pan de centeno', cat: 'carbo', kcal: 259, p: 8.5, c: 48, f: 3.3 },
        { name: 'Pan de avena', cat: 'carbo', kcal: 269, p: 10, c: 48, f: 4 },
        { name: 'Pan de molde (Sin lactosa)', cat: 'carbo', kcal: 265, p: 9, c: 49, f: 3 },
        { name: 'Pan pita / árabe (blanco)', cat: 'carbo', kcal: 275, p: 9, c: 55, f: 1.2 },
        { name: 'Pan árabe integral', cat: 'carbo', kcal: 260, p: 10, c: 51, f: 1.5 },
        { name: 'Pan de hamburguesa/hot dog', cat: 'carbo', kcal: 277, p: 10, c: 50, f: 4 },
        { name: 'Tortillas de harina (trigo)', cat: 'carbo', kcal: 312, p: 8, c: 49, f: 8 },
        { name: 'Tortillas de maíz', cat: 'carbo', kcal: 218, p: 6, c: 45, f: 3 },
        { name: 'Galletas de arroz', cat: 'carbo', kcal: 387, p: 8, c: 81, f: 3 },
        { name: 'Galletitas de agua (Crackers)', cat: 'carbo', kcal: 434, p: 10, c: 68, f: 12 },
        { name: 'Croissant / Medialuna', cat: 'carbo', kcal: 406, p: 8, c: 45, f: 21 }
      ]
    }
  ];

  const globalFoodDB = foodCategories.flatMap(c => c.items);
  const [isExporting, setIsExporting] = useState(false);

  const toggleFood = (foodName: string) => {
    setSelectedFoods(prev => 
      prev.includes(foodName) ? prev.filter(f => f !== foodName) : [...prev, foodName]
    );
  };

  const calculateMetrics = () => {
    // 1. Body Frame Size
    // r = height / wrist
    const r = height / wrist;
    let frame = 'Mediana';
    if (gender === 'male') {
      if (r > 10.4) frame = 'Pequeña';
      else if (r >= 9.6) frame = 'Mediana';
      else frame = 'Grande';
    } else {
      if (r > 11.0) frame = 'Pequeña';
      else if (r >= 10.1) frame = 'Mediana';
      else frame = 'Grande';
    }
    setFrameSize(frame);

    // 2. Ideal Body Weight (Devine formula approx)
    // Hombres: 50.0 kg + 2.3 kg por cada pulgada sobre 5 pies
    // Mujeres: 45.5 kg + 2.3 kg por cada pulgada sobre 5 pies
    const heightInInches = height / 2.54;
    const inchesOver5Feet = heightInInches - 60;
    let idealWeight = gender === 'male' ? 50.0 + (2.3 * inchesOver5Feet) : 45.5 + (2.3 * inchesOver5Feet);
    
    // Adjust by frame size
    if (frame === 'Pequeña') idealWeight = idealWeight * 0.9;
    if (frame === 'Grande') idealWeight = idealWeight * 1.1;
    setIbw(Math.max(0, idealWeight));

    // 3. BMR (Mifflin-St Jeor)
    let calculatedBmr = (10 * weight) + (6.25 * height) - (5 * age);
    calculatedBmr += gender === 'male' ? 5 : -161;
    setBmr(calculatedBmr);

    // 4. TDEE
    const calculatedTdee = calculatedBmr * activityLevel;
    setTdee(calculatedTdee);

    setCalculated(true);
    setActiveTab('diet');
  };

  const generateDiet = () => {
    if (tdee === 0) return alert('Por favor, calcula primero tus requerimientos antropométricos.');
    if (selectedFoods.length === 0) return alert('Por favor selecciona al menos UN alimento en las persianas. Si solo seleccionas 1, ¡toda tu dieta usará ese alimento!');

    const targetCalories = tdee - deficit;
    const macros = {
      protein: Math.round((targetCalories * 0.3) / 4), 
      carbs: Math.round((targetCalories * 0.4) / 4), 
      fats: Math.round((targetCalories * 0.3) / 9)
    };

    // Filtramos la BD global con las selecciones del usuario
    const userDB = globalFoodDB.filter(f => selectedFoods.includes(f.name));

    // Helpers ultra-estrictos
    const getFoodCustom = (filterFn: (f: any) => boolean, i: number, excludeNames: string[] = []) => {
      // 1. Buscamos primero en lo que el usuario seleccionó
      let options = userDB.filter(f => filterFn(f) && !excludeNames.includes(f.name));
      
      // 2. Si el usuario no seleccionó NADA que cumpla la regla (ej: no seleccionó bebidas, o no seleccionó carbohidratos),
      // en vez de meterle una hamburguesa a la fuerza, buscamos en la base de datos GLOBAL una opción real y coherente.
      if (options.length === 0) {
          options = globalFoodDB.filter(f => filterFn(f) && !excludeNames.includes(f.name)); 
      }
      
      return options[i % options.length] || globalFoodDB[0];
    };

    const dietPlan = {
      targetCalories: Math.round(targetCalories),
      macros,
      duration,
      constipationWarning: constipation,
      gutFloraWarning: gutFlora,
      days: Array.from({ length: duration }).map((_, i) => {
        const calc = (food: any, targetMacro: number, type: 'p'|'c', isDrink = false) => {
          if (!food || food[type] < 2 || isDrink) {
             const fixed = isDrink ? 250 : (food?.cat === 'snack' ? 50 : 200);
             const unit = isDrink || food?.cat === 'bebida' ? 'ml' : 'g';
             const kcal = Math.round((fixed / 100) * (food?.kcal || 0));
             return { g: fixed, kcal, str: `${food?.name || 'Libre'} (${fixed}${unit})` };
          }
          let grams = Math.round((targetMacro / food[type]) * 100);
          if (grams > 350) grams = 350; // Tope lógico
          const kcal = Math.round((grams / 100) * food.kcal);
          return { g: grams, kcal, str: `${food.name} (${grams}g)` };
        };

        const dayPlan: any = { day: `Día ${i + 1}`, meals: [] };
        
        // --- DESAYUNO --- (Solo huevos, quesos, lácteos, pan, avena, fruta)
        const d_p = getFoodCustom(f => f.cat === 'lacteo' || f.name.includes('Huevo') || f.name.includes('Queso'), i);
        const d_c = getFoodCustom(f => f.cat === 'fruta' || f.name.includes('Pan') || f.name.includes('Avena') || f.name.includes('Gallet'), i);
        const d_b = getFoodCustom(f => f.cat === 'bebida', i);
        const res_d_p = calc(d_p, macros.protein * 0.25, 'p');
        const res_d_c = calc(d_c, macros.carbs * 0.25, 'c');
        const res_d_b = calc(d_b, 0, 'c', true);
        
        dayPlan.meals.push({
          name: 'Desayuno',
          foods: `${res_d_p.str} + ${res_d_c.str} + ${res_d_b.str} | ${res_d_p.kcal + res_d_c.kcal + res_d_b.kcal} kcal`
        });

        // --- ALMUERZO --- (Carnes que no sean huevo, arroces, fideos, complejos, vegetales)
        const a_p = getFoodCustom(f => (f.cat === 'proteina' && !f.name.includes('Huevo')) || f.cat === 'complejo', i + 1);
        const a_c = getFoodCustom(f => f.cat === 'carbo' && !f.name.includes('Pan') && !f.name.includes('Gallet'), i + 1);
        const a_v = getFoodCustom(f => f.cat === 'vegetal', i);
        const a_b = getFoodCustom(f => f.cat === 'bebida', i + 1);
        
        const res_a_b = calc(a_b, 0, 'c', true);

        if (a_p.cat === 'complejo') {
            const res = calc(a_p, macros.carbs * 0.40, 'c');
            dayPlan.meals.push({ name: 'Almuerzo', foods: `${res.str} + ${res_a_b.str} | ${res.kcal + res_a_b.kcal} kcal` });
        } else {
            const res_a_p = calc(a_p, macros.protein * 0.40, 'p');
            const res_a_c = calc(a_c, macros.carbs * 0.40, 'c');
            dayPlan.meals.push({ name: 'Almuerzo', foods: `${res_a_p.str} + ${res_a_c.str} + ${a_v.name} (150g) + ${res_a_b.str} | ${res_a_p.kcal + res_a_c.kcal + 20 + res_a_b.kcal} kcal` });
        }

        // --- MERIENDA --- (Evita duplicados)
        const sn1 = getFoodCustom(f => f.cat === 'fruta' || f.cat === 'lacteo', i);
        const sn2 = getFoodCustom(f => f.cat === 'snack' || f.name.includes('Pan'), i + 1, [sn1.name]);
        const r_sn1 = calc(sn1, macros.carbs * 0.10, 'c');
        const r_sn2 = calc(sn2, macros.protein * 0.10, 'p');
        dayPlan.meals.push({
          name: 'Merienda',
          foods: `${r_sn1.str} + ${r_sn2.str} | ${r_sn1.kcal + r_sn2.kcal} kcal`
        });

        // --- CENA ---
        const c_p = getFoodCustom(f => (f.cat === 'proteina' && !f.name.includes('Huevo')) || f.cat === 'complejo', i + 2);
        const c_v = getFoodCustom(f => f.cat === 'vegetal', i + 1);
        const c_b = getFoodCustom(f => f.cat === 'bebida', i + 2);
        const res_c_b = calc(c_b, 0, 'c', true);
        
        if (c_p.cat === 'complejo') {
            const res = calc(c_p, macros.protein * 0.25, 'p');
            dayPlan.meals.push({ name: 'Cena', foods: `${res.str} + ${res_c_b.str} | ${res.kcal + res_c_b.kcal} kcal` });
        } else {
            const res_c_p = calc(c_p, macros.protein * 0.25, 'p');
            dayPlan.meals.push({ name: 'Cena', foods: `${res_c_p.str} + ${c_v.name} (200g) + ${res_c_b.str} | ${res_c_p.kcal + 40 + res_c_b.kcal} kcal` });
        }

        return dayPlan;
      })
    };

    setGeneratedDiet(dietPlan);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('diet-plan-container');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { 
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Plan_Nutricional_GymMaster.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const inputStyle = {
    background: '#1e293b', border: '1px solid #334155', borderRadius: '0', 
    padding: '12px 14px', color: '#fff', fontSize: '14px', fontWeight: 700,
    width: '100%', boxSizing: 'border-box' as const, outline: 'none'
  };
  const labelStyle = { color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' };

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Apple color="#22c55e" size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Evaluación <span style={{ color: '#22c55e' }}>Nutricional</span>
          </h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '13px' }}>Cálculo Antropométrico y Generador de Dietas (Déficit Calórico)</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('calculator')}
          style={{ background: activeTab === 'calculator' ? '#22c55e' : 'transparent', color: activeTab === 'calculator' ? '#000' : '#94a3b8', border: 'none', padding: '10px 24px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Activity size={16} /> 1. Antropometría
        </button>
        <button
          onClick={() => {
            if (!calculated) alert('Calcula la antropometría primero.');
            else setActiveTab('diet');
          }}
          style={{ background: activeTab === 'diet' ? '#22c55e' : 'transparent', color: activeTab === 'diet' ? '#000' : '#94a3b8', border: 'none', padding: '10px 24px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', cursor: calculated ? 'pointer' : 'not-allowed', opacity: calculated ? 1 : 0.5, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Apple size={16} /> 2. Creador de Dieta
        </button>
      </div>

      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Formulario */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '24px', borderRadius: '0' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#22c55e', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={18} /> Datos del Paciente
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Género</label>
                <select style={inputStyle} value={gender} onChange={e => setGender(e.target.value as any)}>
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Edad (años)</label>
                <input type="number" style={inputStyle} value={age} onChange={e => setAge(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input type="number" style={inputStyle} value={weight} onChange={e => setWeight(Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Altura (cm)</label>
                <input type="number" style={inputStyle} value={height} onChange={e => setHeight(Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Muñeca (cm)</label>
                <input type="number" style={inputStyle} value={wrist} onChange={e => setWrist(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Nivel de Actividad Física</label>
              <select style={inputStyle} value={activityLevel} onChange={e => setActivityLevel(Number(e.target.value))}>
                <option value={1.2}>Sedentario (Poco o nada de ejercicio)</option>
                <option value={1.375}>Ligero (1-3 días por semana)</option>
                <option value={1.55}>Moderado (3-5 días por semana)</option>
                <option value={1.725}>Intenso (6-7 días por semana)</option>
                <option value={1.9}>Muy Intenso (2 veces al día)</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', padding: '16px' }}>
              <h3 style={{ fontSize: '11px', color: '#22c55e', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 900 }}>Observaciones Clínicas (Gastrointestinal)</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" checked={constipation} onChange={e => setConstipation(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Paciente padece de estreñimiento o tránsito lento</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={gutFlora} onChange={e => setGutFlora(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Enfocar dieta en recuperar y mejorar la flora intestinal (microbiota)</span>
              </label>
            </div>

            <button onClick={calculateMetrics} style={{ width: '100%', background: '#22c55e', color: '#000', border: 'none', padding: '14px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Activity size={18} /> Procesar Evaluación
            </button>
          </div>

          {/* Resultados */}
          {calculated && (
            <div style={{ background: '#0f172a', border: '1px solid #22c55e', padding: '24px', borderRadius: '0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(34,197,94,0.1), transparent)', pointerEvents: 'none' }} />
              
              <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#22c55e', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} /> Resultados Antropométricos
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#1e293b', padding: '16px', borderLeft: '4px solid #22c55e' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Body Frame Size (Complexión)</p>
                  <p style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: 900 }}>{frameSize}</p>
                </div>
                
                <div style={{ background: '#1e293b', padding: '16px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Peso Ideal Estimado (IBW)</p>
                  <p style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: 900 }}>{ibw.toFixed(1)} <span style={{ fontSize: '14px', color: '#64748b' }}>kg</span></p>
                </div>

                <div style={{ background: '#1e293b', padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Tasa Metabólica Basal (BMR)</p>
                  <p style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: 900 }}>{Math.round(bmr)} <span style={{ fontSize: '14px', color: '#64748b' }}>kcal/día</span></p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', padding: '16px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#22c55e', textTransform: 'uppercase', fontWeight: 900 }}>Gasto Energético Total (TDEE)</p>
                  <p style={{ margin: 0, fontSize: '28px', color: '#fff', fontWeight: 900 }}>{Math.round(tdee)} <span style={{ fontSize: '16px', color: '#22c55e' }}>kcal/día</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'diet' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Configuración de Dieta */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '24px', borderRadius: '0' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Apple size={18} /> Parámetros de la Dieta
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Déficit Calórico</label>
                <select style={inputStyle} value={deficit} onChange={e => setDeficit(Number(e.target.value))}>
                  <option value={300}>Leve (-300 kcal)</option>
                  <option value={500}>Moderado (-500 kcal)</option>
                  <option value={750}>Agresivo (-750 kcal)</option>
                  <option value={0}>Mantenimiento (0 kcal)</option>
                  <option value={-300}>Volumen Leve (+300 kcal)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Duración</label>
                <select style={inputStyle} value={duration} onChange={e => setDuration(Number(e.target.value))}>
                  <option value={7}>7 Días</option>
                  <option value={30}>30 Días</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Selección Estricta de Alimentos</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {foodCategories.map((category) => (
                  <div key={category.id} style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    <button 
                      onClick={() => setOpenPanel(openPanel === category.id ? null : category.id)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: '12px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      {category.title}
                      {openPanel === category.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {openPanel === category.id && (
                      <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {category.items.map(item => (
                          <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedFoods.includes(item.name)}
                              onChange={() => toggleFood(item.name)}
                              style={{ width: '16px', height: '16px', accentColor: '#22c55e' }}
                            />
                            <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{item.name} <span style={{ color: '#64748b', fontSize: '10px' }}>({item.kcal} kcal / 100g)</span></span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>El sistema construirá TODA la dieta EXCLUSIVAMENTE con los alimentos que marques. (Ej: Si solo marcas Pizza, comerás Pizza 4 veces al día ajustado a calorías).</p>
            </div>

            <button onClick={generateDiet} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: '14px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Calendar size={18} /> Generar Plan Nutricional
            </button>
          </div>

          {/* Plan Generado */}
          {generatedDiet && (
            <div id="diet-plan-container" style={{ background: '#0f172a', border: '1px solid #f59e0b', padding: '24px', borderRadius: '0', position: 'relative' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '20px' }}>
                Plan Generado: {generatedDiet.duration} Días
              </h2>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1, background: '#1e293b', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Objetivo Diario</p>
                  <p style={{ margin: '4px 0 0', fontSize: '20px', color: '#f59e0b', fontWeight: 900 }}>{generatedDiet.targetCalories} <span style={{ fontSize: '12px', color: '#64748b' }}>kcal</span></p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#ef4444', textTransform: 'uppercase', fontWeight: 800 }}>Proteínas</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{generatedDiet.macros.protein}g</p>
                </div>
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 800 }}>Carbos</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{generatedDiet.macros.carbs}g</p>
                </div>
                <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#eab308', textTransform: 'uppercase', fontWeight: 800 }}>Grasas</p>
                  <p style={{ margin: '4px 0 0', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{generatedDiet.macros.fats}g</p>
                </div>
              </div>

              <h3 style={{ fontSize: '12px', color: '#fff', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Estructura del Menú por Día</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {generatedDiet.days.map((d: any, idx: number) => (
                  <div key={idx} style={{ background: '#1e293b', borderTop: '4px solid #3b82f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: '#0f172a', padding: '10px', textAlign: 'center', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid #1e293b' }}>
                      {d.day}
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {d.meals.map((m: any, mIdx: number) => (
                        <div key={mIdx}>
                          <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>{m.name}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#fff', lineHeight: '1.4' }}>{m.foods}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {(generatedDiet.constipationWarning || generatedDiet.gutFloraWarning) && (
                <div style={{ marginTop: '20px', background: 'rgba(245,158,11,0.1)', borderLeft: '4px solid #f59e0b', padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 900 }}>Indicaciones Clínicas Añadidas:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
                    {generatedDiet.constipationWarning && <li><strong>Para el Estreñimiento:</strong> Asegurar un alto consumo de fibra insoluble (salvado de trigo, verduras de hoja verde) y aumentar la ingesta de agua a mínimo 3 litros diarios. Se recomienda incluir ciruelas pasas o semillas de chía hidratadas en el desayuno.</li>}
                    {generatedDiet.gutFloraWarning && <li><strong>Para la Flora Intestinal:</strong> Priorizar alimentos ricos en probióticos naturales (Kéfir, Yogur natural sin azúcar, Chucrut, Kombucha) y fibra prebiótica (plátano verde, avena, ajo, cebolla). Evitar edulcorantes artificiales.</li>}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '20px', background: 'rgba(59,130,246,0.1)', borderLeft: '4px solid #3b82f6', padding: '12px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '11px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 900 }}>💧 Recomendación de Hidratación (Basal)</h4>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
                  Basado en un peso corporal de {weight} kg, se recomienda un consumo diario de <strong>{(weight * 35).toLocaleString()} ml ({(weight * 0.035).toFixed(1)} Litros)</strong> de agua pura. <br/>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>* Aumentar entre 500ml y 1 Litro adicional los días de entrenamiento intenso.</span>
                </p>
              </div>

              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                style={{ marginTop: '24px', width: '100%', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', padding: '10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', opacity: isExporting ? 0.5 : 1 }} 
              >
                <Save size={14} /> {isExporting ? 'Generando PDF...' : 'Descargar Dieta en PDF'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
