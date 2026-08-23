import React, { useState } from 'react';
import { Apple, Activity, Scale, Ruler, Calendar, Check, Save, ChevronDown, ChevronUp } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export const DietPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'diet'>('calculator');

  // Estado del Formulario
  const [patientName, setPatientName] = useState<string>('');
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
  const [celiac, setCeliac] = useState<boolean>(false);
  const [diabetic, setDiabetic] = useState<boolean>(false);
  const [hypertension, setHypertension] = useState<boolean>(false);
  const [pcos, setPcos] = useState<boolean>(false);
  
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
        { name: 'Pizza Margarita (Queso)', cat: 'complejo', kcal: 266, p: 11.4, c: 33.3, f: 9.7, fib: 2.5, warnings: ['celiac', 'gut', 'constipation'] },
        { name: 'Pizza de Pepperoni', cat: 'complejo', kcal: 298, p: 12, c: 34, f: 12, fib: 2.2, warnings: ['celiac', 'gut', 'constipation', 'hypertension'] },
        { name: 'Lasaña de carne magra', cat: 'complejo', kcal: 185, p: 10.8, c: 11.4, f: 10.7, fib: 1.5, warnings: ['celiac', 'gut'] },
        { name: 'Hamburguesa de res (1 patty)', cat: 'complejo', kcal: 295, p: 17, c: 24, f: 14, fib: 1.2, warnings: ['celiac', 'gut', 'constipation', 'hypertension'] },
        { name: 'Milanesa de pollo al horno', cat: 'complejo', kcal: 220, p: 18, c: 15, f: 9, fib: 1.0, warnings: ['celiac'] },
        { name: 'Sushi (Rolls de salmón)', cat: 'complejo', kcal: 140, p: 5, c: 28, f: 1, fib: 0.5, warnings: ['constipation'] },
        { name: 'Empanada de carne al horno', cat: 'complejo', kcal: 260, p: 10, c: 25, f: 12, fib: 1.5, warnings: ['celiac', 'gut', 'constipation', 'hypertension'] },
        { name: 'Caldo de pollo/pescado', cat: 'complejo', kcal: 95, p: 12, c: 4, f: 3, fib: 0, warnings: ['hypertension'] },
        { name: 'Guiso de fideo espagueti con salsa', cat: 'complejo', kcal: 180, p: 8, c: 25, f: 6, fib: 2.0, warnings: ['celiac', 'gut'] },
        { name: 'Guiso de arroz blanco con carne', cat: 'complejo', kcal: 160, p: 8, c: 22, f: 5, fib: 1.0, warnings: ['constipation'] },
        { name: 'Puchero (Sopa de carne con verduras)', cat: 'complejo', kcal: 110, p: 10, c: 12, f: 4, fib: 3.5, warnings: [] },
        { name: 'Guiso de pollo con verduras', cat: 'complejo', kcal: 120, p: 12, c: 8, f: 4, fib: 3.0, warnings: [] }
      ]
    },
    {
      id: 1,
      title: 'Proteínas Magras (Carnes & Vegetales)',
      items: [
        { name: 'Pechuga de Pollo (Grillé/Hervida)', cat: 'proteina', kcal: 165, p: 31, c: 0, f: 3.6, fib: 0, warnings: [] },
        { name: 'Pescado blanco (Tilapia/Merluza)', cat: 'proteina', kcal: 128, p: 26, c: 0, f: 3, fib: 0, warnings: [] },
        { name: 'Salmón a la plancha', cat: 'proteina', kcal: 206, p: 22, c: 0, f: 13, fib: 0, warnings: [] },
        { name: 'Corte de res magro (Vacío/Lomo)', cat: 'proteina', kcal: 250, p: 26, c: 0, f: 15, fib: 0, warnings: [] },
        { name: 'Carne de res (molida/magra)', cat: 'proteina', kcal: 210, p: 26, c: 0, f: 11, fib: 0, warnings: [] },
        { name: 'Vacío de res', cat: 'proteina', kcal: 250, p: 26, c: 0, f: 15, fib: 0, warnings: [] },
        { name: 'Costilla para asado', cat: 'proteina', kcal: 350, p: 15, c: 0, f: 30, fib: 0, warnings: ['hypertension'] },
        { name: 'Bife de carne (Chorizo/Ancho)', cat: 'proteina', kcal: 290, p: 24, c: 0, f: 22, fib: 0, warnings: [] },
        { name: 'Lomo de Cerdo', cat: 'proteina', kcal: 143, p: 26, c: 0, f: 3.5, fib: 0, warnings: [] },
        { name: 'Atún al natural (en lata)', cat: 'proteina', kcal: 116, p: 25, c: 0, f: 1, fib: 0, warnings: ['hypertension'] },
        { name: 'Huevos revueltos/cocidos (enteros)', cat: 'proteina', kcal: 155, p: 13, c: 1, f: 11, fib: 0, warnings: [] },
        { name: 'Claras de huevo', cat: 'proteina', kcal: 52, p: 11, c: 1, f: 0, fib: 0, warnings: [] },
        { name: 'Tofu firme', cat: 'proteina', kcal: 144, p: 16, c: 3, f: 9, fib: 2.3, warnings: [] },
        { name: 'Camarones / Langostinos', cat: 'proteina', kcal: 99, p: 24, c: 0, f: 0.3, fib: 0, warnings: [] }
      ]
    },
    {
      id: 2,
      title: 'Carbohidratos Complejos & Legumbres',
      items: [
        { name: 'Arroz blanco cocido', cat: 'carbo', kcal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4, warnings: ['constipation', 'pcos'] },
        { name: 'Arroz integral cocido', cat: 'carbo', kcal: 111, p: 2.6, c: 23, f: 0.9, fib: 1.8, warnings: [] },
        { name: 'Quinoa cocida', cat: 'carbo', kcal: 120, p: 4.4, c: 21.3, f: 1.9, fib: 2.8, warnings: [] },
        { name: 'Avena tradicional (hojuelas)', cat: 'carbo', kcal: 389, p: 16.9, c: 66.3, f: 6.9, fib: 10.6, warnings: ['celiac'] },
        { name: 'Fideos / Pasta de trigo', cat: 'carbo', kcal: 131, p: 5, c: 25, f: 1, fib: 1.2, warnings: ['celiac', 'constipation', 'pcos'] },
        { name: 'Papas al horno/hervidas (con piel)', cat: 'carbo', kcal: 86, p: 1.7, c: 20, f: 0.1, fib: 1.8, warnings: [] },
        { name: 'Batata / Boniato hervido', cat: 'carbo', kcal: 86, p: 1.6, c: 20, f: 0.1, fib: 3.0, warnings: [] },
        { name: 'Lentejas cocidas', cat: 'carbo', kcal: 116, p: 9, c: 20, f: 0.4, fib: 7.9, warnings: [] },
        { name: 'Garbanzos cocidos', cat: 'carbo', kcal: 164, p: 8.9, c: 27.4, f: 2.6, fib: 7.6, warnings: [] }
      ]
    },
    {
      id: 3,
      title: 'Vegetales y Hortalizas (Fibra)',
      items: [
        { name: 'Lechuga (hojas frescas)', cat: 'vegetal', kcal: 15, p: 1.4, c: 2.9, f: 0.2, fib: 1.3, warnings: [] },
        { name: 'Tomate fresco', cat: 'vegetal', kcal: 18, p: 0.9, c: 3.9, f: 0.2, fib: 1.2, warnings: [] },
        { name: 'Pepino fresco', cat: 'vegetal', kcal: 15, p: 0.7, c: 3.6, f: 0.1, fib: 0.5, warnings: [] },
        { name: 'Brócoli al vapor', cat: 'vegetal', kcal: 35, p: 2.4, c: 7.2, f: 0.4, fib: 3.3, warnings: [] },
        { name: 'Zanahoria fresca/rallada', cat: 'vegetal', kcal: 41, p: 0.9, c: 9.6, f: 0.2, fib: 2.8, warnings: [] },
        { name: 'Espinaca hervida', cat: 'vegetal', kcal: 23, p: 3, c: 3.8, f: 0.3, fib: 2.4, warnings: [] },
        { name: 'Calabaza / Zapallo hervido', cat: 'vegetal', kcal: 26, p: 1, c: 6.5, f: 0.1, fib: 2.0, warnings: [] },
        { name: 'Calabacín / Zucchini', cat: 'vegetal', kcal: 17, p: 1.2, c: 3.1, f: 0.3, fib: 1.0, warnings: [] },
        { name: 'Aguacate / Palta', cat: 'vegetal', kcal: 160, p: 2, c: 8.5, f: 14.7, fib: 6.7, warnings: [] },
        { name: 'Espárragos al vapor', cat: 'vegetal', kcal: 22, p: 2.4, c: 4.1, f: 0.2, fib: 2.0, warnings: [] }
      ]
    },
    {
      id: 6,
      title: 'Frutas Frescas',
      items: [
        { name: 'Plátano/Banana', cat: 'fruta', kcal: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, warnings: [] },
        { name: 'Manzana fresca (con piel)', cat: 'fruta', kcal: 52, p: 0.3, c: 13.8, f: 0.2, fib: 2.4, warnings: [] },
        { name: 'Naranja', cat: 'fruta', kcal: 47, p: 0.9, c: 11.8, f: 0.1, fib: 2.4, warnings: [] },
        { name: 'Frutillas / Fresas', cat: 'fruta', kcal: 32, p: 0.7, c: 7.7, f: 0.3, fib: 2.0, warnings: [] },
        { name: 'Arándanos', cat: 'fruta', kcal: 57, p: 0.7, c: 14.5, f: 0.3, fib: 2.4, warnings: [] },
        { name: 'Kiwi', cat: 'fruta', kcal: 61, p: 1.1, c: 14.7, f: 0.5, fib: 3.0, warnings: [] },
        { name: 'Papaya', cat: 'fruta', kcal: 43, p: 0.5, c: 10.8, f: 0.3, fib: 1.7, warnings: [] },
        { name: 'Pomelo / Toronja', cat: 'fruta', kcal: 42, p: 0.8, c: 10.7, f: 0.1, fib: 1.6, warnings: [] },
        { name: 'Mandarina', cat: 'fruta', kcal: 53, p: 0.8, c: 13.3, f: 0.3, fib: 1.8, warnings: [] },
        { name: 'Piña / Ananá', cat: 'fruta', kcal: 50, p: 0.5, c: 13.1, f: 0.1, fib: 1.4, warnings: [] },
        { name: 'Sandía', cat: 'fruta', kcal: 30, p: 0.6, c: 7.6, f: 0.2, fib: 0.4, warnings: [] },
        { name: 'Melón', cat: 'fruta', kcal: 34, p: 0.8, c: 8.2, f: 0.2, fib: 0.9, warnings: [] },
        { name: 'Uvas frescas', cat: 'fruta', kcal: 69, p: 0.7, c: 18.1, f: 0.2, fib: 0.9, warnings: [] },
        { name: 'Mango', cat: 'fruta', kcal: 60, p: 0.8, c: 15, f: 0.4, fib: 1.6, warnings: [] },
        { name: 'Guayaba', cat: 'fruta', kcal: 68, p: 2.6, c: 14.3, f: 1, fib: 5.4, warnings: [] },
        { name: 'Maracuyá / Mburucuyá', cat: 'fruta', kcal: 97, p: 2.2, c: 23.4, f: 0.7, fib: 10.4, warnings: [] },
        { name: 'Pera (con piel)', cat: 'fruta', kcal: 57, p: 0.4, c: 15.2, f: 0.1, fib: 3.1, warnings: [] },
        { name: 'Durazno / Melocotón', cat: 'fruta', kcal: 39, p: 0.9, c: 9.5, f: 0.3, fib: 1.5, warnings: [] },
        { name: 'Ciruela', cat: 'fruta', kcal: 46, p: 0.7, c: 11.4, f: 0.3, fib: 1.4, warnings: [] }
      ]
    },
    {
      id: 4,
      title: 'Lácteos, Bebidas y Grasas Saludables',
      items: [
        { name: 'Leche entera', cat: 'lacteo', kcal: 62, p: 3.2, c: 4.8, f: 3.2, fib: 0, warnings: [] },
        { name: 'Leche descremada', cat: 'lacteo', kcal: 34, p: 3.4, c: 5, f: 0.1, fib: 0, warnings: [] },
        { name: 'Leche deslactosada', cat: 'lacteo', kcal: 43, p: 3.4, c: 5, f: 1, fib: 0, warnings: [] },
        { name: 'Leche de almendras (sin azúcar)', cat: 'lacteo', kcal: 15, p: 0.1, c: 0.1, f: 1, fib: 0, warnings: [] },
        { name: 'Yogur natural sin azúcar', cat: 'lacteo', kcal: 60, p: 4, c: 5, f: 3, fib: 0, warnings: [] },
        { name: 'Queso Cottage magro', cat: 'proteina', kcal: 98, p: 11, c: 3.4, f: 4.3, fib: 0, warnings: [] },
        { name: 'Almendras / Nueces (Frutos secos)', cat: 'snack', kcal: 579, p: 21.2, c: 21.6, f: 49.9, fib: 12.5, warnings: [] },
        { name: 'Aceite de Oliva Extra Virgen', cat: 'grasa', kcal: 884, p: 0, c: 0, f: 100, fib: 0, warnings: [] },
        { name: 'Chocolate amargo >70%', cat: 'snack', kcal: 598, p: 7.8, c: 45.9, f: 42.6, fib: 10.9, warnings: [] },
        { name: 'Café / Té sin azúcar', cat: 'bebida', kcal: 2, p: 0.1, c: 0.1, f: 0.1, fib: 0, warnings: [] },
        { name: 'Agua mineral', cat: 'bebida', kcal: 0, p: 0, c: 0, f: 0, fib: 0, warnings: [] },
        { name: 'Jugo de Limón (natural, con stevia)', cat: 'bebida', kcal: 22, p: 0.4, c: 6.9, f: 0.2, fib: 0.3, warnings: [] },
        { name: 'Jugo de Naranja (natural, con stevia)', cat: 'bebida', kcal: 45, p: 0.7, c: 10.4, f: 0.2, fib: 0.2, warnings: ['diabetic', 'pcos'] },
        { name: 'Jugo de Pomelo / Toronja (natural, con stevia)', cat: 'bebida', kcal: 39, p: 0.5, c: 9.2, f: 0.1, fib: 0.1, warnings: ['diabetic', 'pcos'] },
        { name: 'Jugo de Melón (natural, con stevia)', cat: 'bebida', kcal: 34, p: 0.8, c: 8.2, f: 0.2, fib: 0.9, warnings: ['diabetic', 'pcos'] },
        { name: 'Licuado de Banana (con stevia)', cat: 'bebida', kcal: 75, p: 2, c: 16, f: 1.5, fib: 1.8, warnings: [] }
      ]
    },
    {
      id: 5,
      title: 'Panadería y Masas',
      items: [
        { name: 'Pan integral de trigo', cat: 'carbo', kcal: 259, p: 13, c: 41, f: 4, fib: 7.0, warnings: ['celiac'] },
        { name: 'Pan blanco (molde)', cat: 'carbo', kcal: 265, p: 9, c: 49, f: 3.2, fib: 2.7, warnings: ['celiac', 'gut', 'constipation', 'pcos'] },
        { name: 'Pan de molde (Sin lactosa)', cat: 'carbo', kcal: 265, p: 9, c: 49, f: 3.0, fib: 2.7, warnings: ['celiac', 'gut', 'constipation', 'pcos'] },
        { name: 'Pan de molde (Sin gluten)', cat: 'carbo', kcal: 280, p: 4, c: 51, f: 5, fib: 3.5, warnings: ['gut', 'constipation', 'pcos'] },
        { name: 'Pan pita / árabe (Sin gluten)', cat: 'carbo', kcal: 285, p: 4.5, c: 53, f: 5.5, fib: 3.0, warnings: ['pcos'] },
        { name: 'Pan pita / árabe (Sin lactosa)', cat: 'carbo', kcal: 275, p: 9, c: 55, f: 1.2, fib: 2.2, warnings: ['celiac', 'pcos'] },
        { name: 'Pan francés / Baguette', cat: 'carbo', kcal: 274, p: 9, c: 52, f: 1.5, fib: 2.5, warnings: ['celiac', 'gut', 'constipation', 'pcos'] },
        { name: 'Pan de salvado', cat: 'carbo', kcal: 247, p: 10, c: 42, f: 3, fib: 6.0, warnings: ['celiac'] },
        { name: 'Pan de centeno', cat: 'carbo', kcal: 259, p: 8.5, c: 48, f: 3.3, fib: 5.8, warnings: ['celiac'] },
        { name: 'Pan de avena', cat: 'carbo', kcal: 269, p: 10, c: 48, f: 4, fib: 5.0, warnings: ['celiac'] },
        { name: 'Pan pita / árabe (blanco)', cat: 'carbo', kcal: 275, p: 9, c: 55, f: 1.2, fib: 2.2, warnings: ['celiac', 'pcos'] },
        { name: 'Pan árabe integral', cat: 'carbo', kcal: 260, p: 10, c: 51, f: 1.5, fib: 6.5, warnings: ['celiac'] },
        { name: 'Pan de hamburguesa/hot dog', cat: 'carbo', kcal: 277, p: 10, c: 50, f: 4, fib: 2.0, warnings: ['celiac', 'gut', 'constipation', 'pcos'] },
        { name: 'Tortillas de harina (trigo)', cat: 'carbo', kcal: 312, p: 8, c: 49, f: 8, fib: 2.5, warnings: ['celiac', 'pcos'] },
        { name: 'Tortillas de maíz', cat: 'carbo', kcal: 218, p: 6, c: 45, f: 2.8, fib: 6.3, warnings: [] },
        { name: 'Galletas de arroz', cat: 'carbo', kcal: 387, p: 8.2, c: 81.5, f: 2.8, fib: 4.0, warnings: [] },
        { name: 'Galletitas de agua (Crackers)', cat: 'carbo', kcal: 434, p: 10, c: 68, f: 12, fib: 3.0, warnings: ['celiac', 'gut', 'constipation', 'pcos'] },
        { name: 'Croissant / Medialuna', cat: 'carbo', kcal: 406, p: 8, c: 45, f: 21, fib: 2.6, warnings: ['celiac', 'gut', 'constipation', 'pcos', 'hypertension'] }
      ]
    }
  ];

  const globalFoodDB = foodCategories.flatMap(c => c.items);
  const isFoodDisabled = (foodName) => {
    const food = globalFoodDB.find(f => f.name === foodName);
    if (!food) return false;
    if (celiac && food.warnings.includes('celiac')) return true;
    if (diabetic && food.warnings.includes()) return true;
    if (constipation && food.warnings.includes('constipation')) return true;
    if (gutFlora && food.warnings.includes('gut')) return true;
    if (hypertension && food.warnings.includes('hypertension')) return true;
    if (pcos && food.warnings.includes('pcos')) return true;
    return false;
  };

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

    const targetCalories = tdee + deficit;

    // Macros distribution by gender
    const macros = {
      protein: (targetCalories * (gender === 'female' ? 0.35 : 0.40)) / 4,
      carbs: (targetCalories * (gender === 'female' ? 0.35 : 0.40)) / 4,
      fats: (targetCalories * (gender === 'female' ? 0.30 : 0.20)) / 9
    };

    // ISSN Timing: if activity is intense, shift carbs to pre/post workout (simulated in Lunch and Snack)
    const isIntense = activityLevel >= 1.725;
    const dist = isIntense ? {
        break_c: 0.20, lunch_c: 0.35, snack_c: 0.25, dinner_c: 0.20
    } : {
        break_c: 0.25, lunch_c: 0.40, snack_c: 0.10, dinner_c: 0.25
    };
    
    // Normal protein dist
    const p_dist = { break_p: 0.25, lunch_p: 0.40, snack_p: 0.10, dinner_p: 0.25 };
    const f_dist = { lunch_f: 0.50, dinner_f: 0.50 };

    const userDB = selectedFoods.map(name => globalFoodDB.find(f => f.name === name)).filter(Boolean);

    const getFoodCustom = (filterFn: (f: any) => boolean, i: number, excludeNames: string[] = []) => {
      let options = userDB.filter(f => filterFn(f) && !excludeNames.includes(f.name));
      if (options.length === 0) {
          options = globalFoodDB.filter(f => filterFn(f) && !excludeNames.includes(f.name) && !isFoodDisabled(f.name)); 
      }
      return options[i % options.length] || globalFoodDB[0];
    };

    let totalDietFiber = 0; // Para advertencia general en el reporte

    const dietPlan = {
      targetCalories: Math.round(targetCalories),
      macros: { protein: Math.round(macros.protein), carbs: Math.round(macros.carbs), fats: Math.round(macros.fats) },
      duration,
      constipationWarning: constipation,
      gutFloraWarning: gutFlora,
      celiacWarning: celiac,
      diabeticWarning: diabetic,
      hypertensionWarning: hypertension,
      pcosWarning: pcos,
      lowFiberWarning: false,
      days: Array.from({ length: duration }).map((_, i) => {
        let dailyFiber = 0;
        let currentDayKcal = 0;

        const getSalad = (index: number, grams: number) => {
           let allVeggies = userDB.filter(f => f.cat === 'vegetal');
           if (allVeggies.length === 0) {
               allVeggies = globalFoodDB.filter(f => f.cat === 'vegetal' && !isFoodDisabled(f.name));
           }
           if (allVeggies.length <= 1) {
               const v = allVeggies[0];
               if (v) dailyFiber += (grams / 100) * (v.fib || 0);
               return `${v?.name || 'Vegetales'} (${grams}g)`;
           }
           
           const numToCombine = Math.min(allVeggies.length, (index % 2 === 0) ? 2 : 3);
           const combo = [];
           let comboFib = 0;
           for (let j = 0; j < numToCombine; j++) {
               const veg = allVeggies[(index + j) % allVeggies.length];
               combo.push(veg);
               comboFib += (veg.fib || 0);
           }
           dailyFiber += (grams / 100) * (comboFib / numToCombine); // Promedio ponderado

           const cleanName = (n: string) => n.split(' ')[0].replace(',', '');
           const names = combo.map(v => cleanName(v.name));
           
           let saladStr = 'Ensalada mixta de ';
           if (names.length === 2) saladStr += `${names[0]} y ${names[1]}`;
           else if (names.length >= 3) saladStr += `${names[0]}, ${names[1]} y ${names[2]}`;
           
           return `${saladStr} (${grams}g)`;
        };

        const calc = (food: any, targetMacro: number, type: 'p'|'c'|'f', isDrink = false) => {
          if (!food || food[type] < 2 || isDrink) {
             const snackSize = gender === 'female' ? 30 : 50;
             const mealSize = gender === 'female' ? 150 : 200;
             const fixed = isDrink ? 250 : (food?.cat === 'snack' ? snackSize : mealSize);
             const unit = isDrink || food?.cat === 'bebida' ? 'ml' : 'g';
             const kcal = Math.round((fixed / 100) * (food?.kcal || 0));
             dailyFiber += (fixed / 100) * (food?.fib || 0);
             return { g: fixed, kcal, str: `${food?.name || 'Libre'} (${fixed}${unit})` };
          }
          
          let grams = Math.round((targetMacro / food[type]) * 100);
          
          // Límite Calórico Dinámico (PARCHE PARA NO SOBREPASAR)
          let maxKcal = targetCalories * 0.25; 
          if (food.cat === 'snack') maxKcal = targetCalories * 0.10;
          else if (food.cat === 'carbo') maxKcal = targetCalories * 0.15;
          else if (food.cat === 'complejo') maxKcal = targetCalories * 0.25;
          
          let remaining = targetCalories - currentDayKcal;
          if (remaining < 80) remaining = 80;
          if (maxKcal > remaining * 0.8) maxKcal = remaining * 0.8;
          
          if (food.kcal > 0 && (grams / 100) * food.kcal > maxKcal) {
             grams = Math.round((maxKcal / food.kcal) * 100);
          }
          
          if (food.cat === 'snack') {
              const maxSnack = gender === 'female' ? 40 : 60;
              if (grams > maxSnack) grams = maxSnack;
          } else if (grams > 350 && !isDrink) {
              grams = 350;
          }

          let extraInfo = '';
          if (diabetic || pcos) {
             if (food.cat === 'complejo') {
                if (grams > 150) grams = 150; 
                extraInfo = ' (⚠️ Porción controlada. Ingerir ensalada rica en fibra ANTES)';
             } else if (food.name.includes('Sushi')) {
                if (grams > 150) grams = 150;
                extraInfo = ' (⚠️ Máx 5-6 piezas. Sin salsas dulces)';
             } else if (food.name.includes('Hamburguesa') || food.name.includes('Hot Dog')) {
                extraInfo = ' (⚠️ Quitar la tapa superior del pan. Sin salsas dulces)';
             } else if (food.name.includes('Pizza') || food.name.includes('Empanada')) {
                if (grams > 150) grams = 150;
                extraInfo = ' (⚠️ Acompañar con ensalada obligatoriamente)';
             } else if (food.cat === 'carbo') {
                if (grams > 180) grams = 180;
                if (food.name.includes('blanco') || food.name.includes('Puré')) {
                   extraInfo = ' (⚠️ Carbohidrato rápido. Combinar con proteína/grasa)';
                }
             }
          }
          if (hypertension && food.name.includes('Queso')) {
              extraInfo += ' (⚠️ Evitar añadir sal extra, el queso ya contiene sodio)';
          }
          
          let finalKcal = Math.round((grams / 100) * food.kcal);
          const unit = (food.cat === 'bebida' || (food.cat === 'lacteo' && food.name.includes('Leche'))) ? 'ml' : 'g';
          let finalStr = `${food.name} (${grams}${unit})${extraInfo}`;

          if (food.name.includes('Pan ') || food.name.startsWith('Pan')) {
              finalKcal += 80;
              finalStr += ` + 1 feta de Queso/Jamón (30g)`;
          }

          currentDayKcal += finalKcal;
          dailyFiber += (grams / 100) * (food.fib || 0);
          return { g: grams, kcal: finalKcal, str: finalStr };
        };

        const dayPlan: any = { day: `Día ${i + 1}`, meals: [], totalDayKcal: 0 };
        
        // --- DESAYUNO --- 
        const d_p = getFoodCustom(f => f.cat === 'lacteo' || f.name.includes('Huevo') || (f.cat === 'proteina' && f.name.includes('Queso')), i);
        const d_c = getFoodCustom(f => f.cat === 'fruta' || f.name.includes('Pan') || f.name.includes('Avena') || f.name.includes('Gallet'), i);
        const d_b = getFoodCustom(f => f.cat === 'bebida', i);
        const res_d_p = calc(d_p, macros.protein * p_dist.break_p, 'p');
        const res_d_c = calc(d_c, macros.carbs * dist.break_c, 'c');
        const res_d_b = calc(d_b, 0, 'c', true);
        
        const kcal_d = res_d_p.kcal + res_d_c.kcal + res_d_b.kcal;
        dayPlan.meals.push({
          name: 'Desayuno',
          foods: `${res_d_p.str} + ${res_d_c.str} + ${res_d_b.str} | ${kcal_d} kcal`
        });
        dayPlan.totalDayKcal += kcal_d;

        // --- ALMUERZO (Harvard Plate) --- 
        const a_p = getFoodCustom(f => (f.cat === 'proteina' && !f.name.toLowerCase().includes('huevo')) || f.cat === 'complejo', i + 1);
        const a_c = getFoodCustom(f => f.cat === 'carbo' && !f.name.includes('Pan') && !f.name.includes('Gallet'), i + 1);
        const a_f = getFoodCustom(f => f.cat === 'grasa' || f.cat === 'snack', i);
        const a_b = getFoodCustom(f => f.cat === 'bebida', i + 1);
        
        const res_a_b = calc(a_b, 0, 'c', true);

        if (a_p.cat === 'complejo') {
            const res = calc(a_p, macros.carbs * dist.lunch_c, 'c');
            const kcal_a = res.kcal + res_a_b.kcal;
            dayPlan.meals.push({ name: 'Almuerzo' + (isIntense ? ' (Pre-Entreno)' : ''), foods: `${res.str} + ${res_a_b.str} | ${kcal_a} kcal` });
            dayPlan.totalDayKcal += kcal_a;
        } else {
            const res_a_p = calc(a_p, macros.protein * p_dist.lunch_p, 'p');
            const res_a_c = calc(a_c, macros.carbs * dist.lunch_c, 'c');
            const res_a_f = calc(a_f, macros.fats * f_dist.lunch_f, 'f');
            const kcal_a = res_a_p.kcal + res_a_c.kcal + res_a_f.kcal + 30 + res_a_b.kcal;
            dayPlan.meals.push({ name: 'Almuerzo' + (isIntense ? ' (Pre-Entreno)' : ''), foods: `${res_a_p.str} + ${res_a_c.str} + ${res_a_f.str} + ${getSalad(i, gender === 'female' ? 100 : 150)} + ${res_a_b.str} | ${kcal_a} kcal` });
            dayPlan.totalDayKcal += kcal_a;
        }

        // --- MERIENDA --- 
        const sn1 = getFoodCustom(f => f.cat === 'fruta' || f.cat === 'lacteo', i);
        const sn2 = getFoodCustom(f => f.cat === 'snack' || f.name.includes('Pan'), i + 1, [sn1.name]);
        const r_sn1 = calc(sn1, macros.carbs * dist.snack_c, 'c');
        const r_sn2 = calc(sn2, macros.protein * p_dist.snack_p, 'p');
        const kcal_s = r_sn1.kcal + r_sn2.kcal;
        dayPlan.meals.push({
          name: 'Merienda' + (isIntense ? ' (Post-Entreno)' : ''),
          foods: `${r_sn1.str} + ${r_sn2.str} | ${kcal_s} kcal`
        });
        dayPlan.totalDayKcal += kcal_s;

        // --- CENA (Harvard Plate) ---
        const c_p = getFoodCustom(f => (f.cat === 'proteina' && !f.name.toLowerCase().includes('huevo')) || f.cat === 'complejo', i + 2);
        const c_c = getFoodCustom(f => f.cat === 'carbo', i + 2);
        const c_f = getFoodCustom(f => f.cat === 'grasa' || f.cat === 'snack', i + 1);
        const c_b = getFoodCustom(f => f.cat === 'bebida', i + 2);
        const res_c_b = calc(c_b, 0, 'c', true);
        
        if (c_p.cat === 'complejo') {
            const res = calc(c_p, macros.protein * p_dist.dinner_p, 'p');
            const kcal_c = res.kcal + res_c_b.kcal;
            dayPlan.meals.push({ name: 'Cena', foods: `${res.str} + ${res_c_b.str} | ${kcal_c} kcal` });
            dayPlan.totalDayKcal += kcal_c;
        } else {
            const res_c_p = calc(c_p, macros.protein * p_dist.dinner_p, 'p');
            const res_c_c = calc(c_c, macros.carbs * dist.dinner_c, 'c');
            const res_c_f = calc(c_f, macros.fats * f_dist.dinner_f, 'f');
            const kcal_c = res_c_p.kcal + res_c_c.kcal + res_c_f.kcal + 40 + res_c_b.kcal;
            dayPlan.meals.push({ name: 'Cena', foods: `${res_c_p.str} + ${res_c_c.str} + ${res_c_f.str} + ${getSalad(i + 1, gender === 'female' ? 150 : 200)} + ${res_c_b.str} | ${kcal_c} kcal` });
            dayPlan.totalDayKcal += kcal_c;
        }

        totalDietFiber += dailyFiber;
        return dayPlan;
      })
    };

    if ((totalDietFiber / duration) < 25) {
        dietPlan.lowFiberWarning = true;
    }

    setGeneratedDiet(dietPlan);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('diet-plan-container');
    if (!element) return;
    
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 150)); // Allow React to re-render textareas as divs
    try {
      const opt = {
        margin:       10,
        filename:     'Plan_Nutricional_GymMaster.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, backgroundColor: '#0f172a' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      await html2pdf().set(opt).from(element).save();
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
            
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nombre del Paciente</label>
              <input type="text" placeholder="Ej. Juan Pérez" style={inputStyle} value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>
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
              <h3 style={{ fontSize: '11px', color: '#22c55e', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 900 }}>Observaciones Clínicas (Gastrointestinal y Metabólico)</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" checked={constipation} onChange={e => {
                  setConstipation(e.target.checked);
                  if (e.target.checked) { setGutFlora(false); setCeliac(false); setDiabetic(false); setHypertension(false); setPcos(false); }
                }} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Estreñimiento o tránsito lento</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" checked={gutFlora} onChange={e => {
                  setGutFlora(e.target.checked);
                  if (e.target.checked) { setConstipation(false); setCeliac(false); setDiabetic(false); setHypertension(false); setPcos(false); }
                }} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Mejorar la flora intestinal (microbiota)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" checked={celiac} onChange={e => {
                  setCeliac(e.target.checked);
                  if (e.target.checked) { setConstipation(false); setGutFlora(false); setDiabetic(false); setHypertension(false); setPcos(false); }
                }} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Paciente Celíaco (libre de TACC)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" checked={diabetic} onChange={e => {
                  setDiabetic(e.target.checked);
                  if (e.target.checked) { setConstipation(false); setGutFlora(false); setCeliac(false); setHypertension(false); setPcos(false); }
                }} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Paciente Diabético (control glucémico)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="checkbox" checked={hypertension} onChange={e => {
                  setHypertension(e.target.checked);
                  if (e.target.checked) { setConstipation(false); setGutFlora(false); setCeliac(false); setDiabetic(false); setPcos(false); }
                }} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Hipertensión (Dieta DASH baja en sodio)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={pcos} onChange={e => {
                  setPcos(e.target.checked);
                  if (e.target.checked) { setConstipation(false); setGutFlora(false); setCeliac(false); setDiabetic(false); setHypertension(false); }
                }} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Síndrome de Ovario Poliquístico (SOP)</span>
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
                  <option value={14}>14 Días</option>
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
                              disabled={isFoodDisabled(item.name)}
                              checked={selectedFoods.includes(item.name) && !isFoodDisabled(item.name)}
                              onChange={() => toggleFood(item.name)}
                              style={{ width: '16px', height: '16px', accentColor: '#22c55e', opacity: isFoodDisabled(item.name) ? 0.3 : 1 }}
                            />
                            <span style={{ color: isFoodDisabled(item.name) ? '#475569' : '#cbd5e1', fontSize: '13px', textDecoration: isFoodDisabled(item.name) ? 'line-through' : 'none' }}>
                              {item.name} <span style={{ color: '#64748b', fontSize: '10px' }}>({item.kcal} kcal / 100{item.cat === 'bebida' || (item.cat === 'lacteo' && item.name.includes('Leche')) ? 'ml' : 'g'})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>El sistema construirá TODA la dieta EXCLUSIVAMENTE con los alimentos que marques. (Si no marcas NINGUNO, el sistema generará una dieta variada automáticamente).</p>
            </div>

            <button onClick={generateDiet} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: '14px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Calendar size={18} /> {selectedFoods.length === 0 ? 'Generar Dieta Automática' : 'Generar Plan Nutricional'}
            </button>
          </div>

          {/* Plan Generado */}
          {generatedDiet && (
            <div id="diet-plan-container" style={{ background: '#0f172a', border: '1px solid #f59e0b', padding: '24px', borderRadius: '0', position: 'relative' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '20px' }}>
                Plan Generado: {patientName || 'Paciente'} ({gender === 'male' ? 'Hombre' : 'Mujer'}) - {generatedDiet.duration} Días
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
              
              {generatedDiet.lowFiberWarning && (
                <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid #eab308', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#eab308', fontWeight: 800 }}>⚠️ ADVERTENCIA DE FIBRA (Recomendación OMS)</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#fef08a' }}>El menú generado contiene menos de 25g de fibra diaria. Se recomienda agregar 1 cucharada (15g) de semillas de chía o lino a las meriendas, o incrementar el consumo de vegetales crudos.</p>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {generatedDiet.days.map((d: any, idx: number) => (
                  <div key={idx} style={{ background: '#1e293b', borderTop: '4px solid #3b82f6', borderRadius: '4px', overflow: 'hidden', pageBreakInside: 'avoid' }}>
                    <div style={{ background: '#0f172a', padding: '10px', textAlign: 'center', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid #1e293b' }}>
                      {d.day}
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {d.meals.map((m: any, mIdx: number) => (
                        <div key={mIdx}>
                          <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>{m.name}</p>
                          {isExporting ? (
                            <div style={{
                               margin: '4px 0 0', 
                               fontSize: '12px', 
                               color: '#fff', 
                               lineHeight: '1.4',
                               padding: '2px',
                               whiteSpace: 'pre-wrap',
                               wordBreak: 'break-word'
                            }}>
                              {m.foods}
                            </div>
                          ) : (
                            <textarea
                              value={m.foods}
                              onChange={(e) => {
                                 const newDiet = { ...generatedDiet };
                                 newDiet.days[idx].meals[mIdx].foods = e.target.value;
                                 setGeneratedDiet(newDiet);
                              }}
                              style={{ 
                                 margin: '4px 0 0', 
                                 fontSize: '12px', 
                                 color: '#fff', 
                                 lineHeight: '1.4',
                                 background: 'transparent',
                                 border: '1px dashed transparent',
                                 width: '100%',
                                 resize: 'none',
                                 overflow: 'hidden',
                                 fontFamily: 'inherit',
                                 outline: 'none',
                                 padding: '2px',
                                 boxSizing: 'border-box'
                              }}
                              onFocus={(e) => e.target.style.border = '1px dashed rgba(255,255,255,0.3)'}
                              onBlur={(e) => e.target.style.border = '1px dashed transparent'}
                              onMouseEnter={(e) => { if(document.activeElement !== e.target) e.target.style.border = '1px dashed rgba(255,255,255,0.1)'; }}
                              onMouseLeave={(e) => { if(document.activeElement !== e.target) e.target.style.border = '1px dashed transparent'; }}
                              rows={Math.max(3, Math.ceil(m.foods.length / 22))}
                            />
                          )}
                        </div>
                      ))}
                      {d.totalDayKcal && (
                        <div style={{ 
                           marginTop: '8px', 
                           paddingTop: '12px', 
                           borderTop: '1px solid #334155', 
                           textAlign: 'center', 
                           color: '#f59e0b', 
                           fontWeight: 900,
                           fontSize: '11px',
                           textTransform: 'uppercase'
                        }}>
                           Total Día: {d.totalDayKcal} kcal
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(generatedDiet.constipationWarning || generatedDiet.gutFloraWarning || generatedDiet.celiacWarning || generatedDiet.diabeticWarning) && (
                <div style={{ marginTop: '20px', background: 'rgba(245,158,11,0.1)', borderLeft: '4px solid #f59e0b', padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 900 }}>Indicaciones Clínicas Añadidas:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
                    {generatedDiet.constipationWarning && <li><strong>Para el Estreñimiento:</strong> Asegurar un alto consumo de fibra insoluble (salvado de trigo, verduras de hoja verde) y aumentar la ingesta de agua a mínimo 3 litros diarios. Se recomienda incluir ciruelas pasas o semillas de chía hidratadas en el desayuno.</li>}
                    {generatedDiet.gutFloraWarning && <li><strong>Para la Flora Intestinal:</strong> Priorizar alimentos ricos en probióticos naturales (Kéfir, Yogur natural sin azúcar, Chucrut, Kombucha) y fibra prebiótica (plátano verde, avena, ajo, cebolla). Evitar edulcorantes artificiales.</li>}
                    {generatedDiet.celiacWarning && <li><strong>Para Celíacos:</strong> Esta dieta debe ser estrictamente libre de gluten (TACC: Trigo, Avena, Cebada, Centeno). Reemplazar pastas, panes o harinas por versiones certificadas sin gluten o alternativas de maíz, arroz y papa.</li>}
                    {generatedDiet.diabeticWarning && <li><strong>Para Diabéticos (Según ADA):</strong> No existen alimentos estrictamente prohibidos (como pizzas o hamburguesas), pero la clave absoluta es el <strong>control de porciones y las combinaciones</strong> (Método del Plato). Acompañe siempre carbohidratos refinados con abundantes vegetales (fibra) y proteínas magras <em>antes</em> de comerlos para retrasar la absorción de glucosa. Evite aderezos azucarados, bebidas con azúcar y limite las porciones de masas.</li>}
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
