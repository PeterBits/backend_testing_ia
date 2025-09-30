const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.routineExercise.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.trainerAthlete.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users (same password for simplicity in development)
  const hashedPassword = await bcrypt.hash("Password123", 12);

  // Create Trainers
  console.log("👨‍🏫 Creating trainers...");
  const trainer1 = await prisma.user.create({
    data: {
      email: "trainer1@gym.com",
      password: hashedPassword,
      name: "Carlos Martínez",
      role: "TRAINER",
    },
  });

  const trainer2 = await prisma.user.create({
    data: {
      email: "trainer2@gym.com",
      password: hashedPassword,
      name: "Ana García",
      role: "TRAINER",
    },
  });

  // Create Athletes
  console.log("🏃 Creating athletes...");
  const athlete1 = await prisma.user.create({
    data: {
      email: "athlete1@gym.com",
      password: hashedPassword,
      name: "Juan Pérez",
      role: "ATHLETE",
    },
  });

  const athlete2 = await prisma.user.create({
    data: {
      email: "athlete2@gym.com",
      password: hashedPassword,
      name: "María López",
      role: "ATHLETE",
    },
  });

  const athlete3 = await prisma.user.create({
    data: {
      email: "athlete3@gym.com",
      password: hashedPassword,
      name: "Pedro Sánchez",
      role: "ATHLETE",
    },
  });

  const athlete4 = await prisma.user.create({
    data: {
      email: "athlete4@gym.com",
      password: hashedPassword,
      name: "Laura Rodríguez",
      role: "ATHLETE",
    },
  });

  // Create Trainer-Athlete relationships
  console.log("🤝 Creating trainer-athlete relationships...");
  await prisma.trainerAthlete.createMany({
    data: [
      { trainerId: trainer1.id, athleteId: athlete1.id },
      { trainerId: trainer1.id, athleteId: athlete2.id },
      { trainerId: trainer1.id, athleteId: athlete3.id },
      { trainerId: trainer2.id, athleteId: athlete3.id },
      { trainerId: trainer2.id, athleteId: athlete4.id },
    ],
  });

  // Create User Metrics for athletes
  console.log("📏 Creating user metrics...");
  await prisma.userMetrics.createMany({
    data: [
      {
        userId: athlete1.id,
        height: 178,
        weight: 75.5,
        age: 28,
        gender: "male",
        bodyFat: 15.2,
        muscleMass: 58.5,
      },
      {
        userId: athlete2.id,
        height: 165,
        weight: 62,
        age: 25,
        gender: "female",
        bodyFat: 22.5,
        muscleMass: 42,
      },
      {
        userId: athlete3.id,
        height: 182,
        weight: 88,
        age: 32,
        gender: "male",
        bodyFat: 18,
        muscleMass: 65,
      },
    ],
  });

  // Create Exercise Catalog
  console.log("📚 Creating exercise catalog...");
  const sentadillas = await prisma.exercise.create({
    data: {
      name: "Sentadillas",
      description: "Ejercicio compuesto para tren inferior que trabaja cuádriceps, glúteos e isquiotibiales",
    },
  });

  const pressBanca = await prisma.exercise.create({
    data: {
      name: "Press de Banca",
      description: "Ejercicio fundamental para pecho, hombros y tríceps",
    },
  });

  const pesoMuerto = await prisma.exercise.create({
    data: {
      name: "Peso Muerto",
      description: "Ejercicio compuesto que trabaja toda la cadena posterior",
    },
  });

  const pressInclinado = await prisma.exercise.create({
    data: {
      name: "Press Inclinado con Mancuernas",
      description: "Variante de press que enfatiza el pectoral superior",
    },
  });

  const remoBarra = await prisma.exercise.create({
    data: {
      name: "Remo con Barra",
      description: "Ejercicio para espalda media y dorsales",
    },
  });

  const curlBiceps = await prisma.exercise.create({
    data: {
      name: "Curl de Bíceps",
      description: "Ejercicio de aislamiento para bíceps",
    },
  });

  const fondos = await prisma.exercise.create({
    data: {
      name: "Fondos en Paralelas",
      description: "Ejercicio compuesto para pecho y tríceps",
    },
  });

  const sentadillaBulgara = await prisma.exercise.create({
    data: {
      name: "Sentadilla Búlgara",
      description: "Sentadilla unilateral para cuádriceps y glúteos",
    },
  });

  const prensaPiernas = await prisma.exercise.create({
    data: {
      name: "Prensa de Piernas",
      description: "Ejercicio de máquina para tren inferior",
    },
  });

  const pesoMuertoRumano = await prisma.exercise.create({
    data: {
      name: "Peso Muerto Rumano",
      description: "Variante que enfatiza isquiotibiales y glúteos",
    },
  });

  const extensiones = await prisma.exercise.create({
    data: {
      name: "Extensiones de Cuádriceps",
      description: "Ejercicio de aislamiento para cuádriceps",
    },
  });

  const burpees = await prisma.exercise.create({
    data: {
      name: "Burpees",
      description: "Ejercicio cardiovascular de cuerpo completo de alta intensidad",
    },
  });

  const mountainClimbers = await prisma.exercise.create({
    data: {
      name: "Mountain Climbers",
      description: "Ejercicio de cardio que trabaja core y resistencia",
    },
  });

  const jumpingJacks = await prisma.exercise.create({
    data: {
      name: "Jumping Jacks",
      description: "Ejercicio cardiovascular clásico",
    },
  });

  const sprints = await prisma.exercise.create({
    data: {
      name: "Sprints en Cinta",
      description: "Intervalos de sprint de alta intensidad",
    },
  });

  const kettlebellSwings = await prisma.exercise.create({
    data: {
      name: "Kettlebell Swings",
      description: "Ejercicio balístico para cadena posterior y cardio",
    },
  });

  const flexiones = await prisma.exercise.create({
    data: {
      name: "Flexiones",
      description: "Ejercicio clásico de peso corporal para pecho y brazos",
    },
  });

  const sentadillaSalto = await prisma.exercise.create({
    data: {
      name: "Sentadillas con Salto",
      description: "Ejercicio pliométrico para potencia de piernas",
    },
  });

  const plancha = await prisma.exercise.create({
    data: {
      name: "Plancha",
      description: "Ejercicio isométrico para fortalecimiento de core",
    },
  });

  const dominadas = await prisma.exercise.create({
    data: {
      name: "Dominadas",
      description: "Ejercicio fundamental de tracción para espalda",
    },
  });

  const pressMilitar = await prisma.exercise.create({
    data: {
      name: "Press Militar",
      description: "Ejercicio compuesto para hombros",
    },
  });

  // Create routines with exercises
  console.log("💪 Creating routines with exercises...");

  // Routine 1: Fuerza - Principiante (self-created by athlete1)
  const routine1 = await prisma.routine.create({
    data: {
      title: "Rutina de Fuerza - Principiante",
      description: "Rutina básica para desarrollar fuerza general",
      userId: athlete1.id,
      createdBy: athlete1.id,
    },
  });

  await prisma.routineExercise.createMany({
    data: [
      {
        routineId: routine1.id,
        exerciseId: sentadillas.id,
        sets: 3,
        reps: 12,
        weight: 60,
        rest: 90,
        order: 1,
      },
      {
        routineId: routine1.id,
        exerciseId: pressBanca.id,
        sets: 3,
        reps: 10,
        weight: 40,
        rest: 120,
        order: 2,
      },
      {
        routineId: routine1.id,
        exerciseId: pesoMuerto.id,
        sets: 3,
        reps: 8,
        weight: 80,
        rest: 120,
        order: 3,
      },
    ],
  });

  // Routine 2: Hipertrofia Tren Superior (trainer1 → athlete1)
  const routine2 = await prisma.routine.create({
    data: {
      title: "Hipertrofia - Tren Superior",
      description: "Rutina de volumen para pecho, espalda y brazos",
      userId: athlete1.id,
      createdBy: trainer1.id,
    },
  });

  await prisma.routineExercise.createMany({
    data: [
      {
        routineId: routine2.id,
        exerciseId: pressInclinado.id,
        sets: 4,
        reps: 10,
        rest: 90,
        order: 1,
      },
      {
        routineId: routine2.id,
        exerciseId: remoBarra.id,
        sets: 4,
        reps: 10,
        rest: 90,
        order: 2,
      },
      {
        routineId: routine2.id,
        exerciseId: curlBiceps.id,
        sets: 3,
        reps: 12,
        rest: 60,
        order: 3,
      },
      {
        routineId: routine2.id,
        exerciseId: fondos.id,
        sets: 3,
        reps: 12,
        rest: 60,
        order: 4,
      },
    ],
  });

  // Routine 3: Hipertrofia Tren Inferior (trainer1 → athlete1)
  const routine3 = await prisma.routine.create({
    data: {
      title: "Hipertrofia - Tren Inferior",
      description: "Rutina de volumen para piernas y glúteos",
      userId: athlete1.id,
      createdBy: trainer1.id,
    },
  });

  await prisma.routineExercise.createMany({
    data: [
      {
        routineId: routine3.id,
        exerciseId: sentadillaBulgara.id,
        sets: 4,
        reps: 10,
        rest: 90,
        order: 1,
      },
      {
        routineId: routine3.id,
        exerciseId: prensaPiernas.id,
        sets: 4,
        reps: 12,
        rest: 90,
        order: 2,
      },
      {
        routineId: routine3.id,
        exerciseId: pesoMuertoRumano.id,
        sets: 3,
        reps: 10,
        rest: 90,
        order: 3,
      },
      {
        routineId: routine3.id,
        exerciseId: extensiones.id,
        sets: 3,
        reps: 15,
        rest: 60,
        order: 4,
      },
    ],
  });

  // Routine 4: Cardio HIIT (trainer1 → athlete2)
  const routine4 = await prisma.routine.create({
    data: {
      title: "Cardio HIIT",
      description: "Entrenamiento de intervalos de alta intensidad",
      userId: athlete2.id,
      createdBy: trainer1.id,
    },
  });

  await prisma.routineExercise.createMany({
    data: [
      {
        routineId: routine4.id,
        exerciseId: burpees.id,
        sets: 4,
        reps: 15,
        rest: 30,
        order: 1,
      },
      {
        routineId: routine4.id,
        exerciseId: mountainClimbers.id,
        sets: 4,
        reps: 20,
        rest: 30,
        order: 2,
      },
      {
        routineId: routine4.id,
        exerciseId: jumpingJacks.id,
        sets: 4,
        reps: 30,
        rest: 30,
        order: 3,
      },
      {
        routineId: routine4.id,
        exerciseId: sprints.id,
        sets: 5,
        reps: 1,
        rest: 60,
        order: 4,
      },
    ],
  });

  // Routine 5: Funcional Full Body (trainer1 → athlete3)
  const routine5 = await prisma.routine.create({
    data: {
      title: "Funcional - Full Body",
      description: "Entrenamiento funcional de cuerpo completo",
      userId: athlete3.id,
      createdBy: trainer1.id,
    },
  });

  await prisma.routineExercise.createMany({
    data: [
      {
        routineId: routine5.id,
        exerciseId: kettlebellSwings.id,
        sets: 4,
        reps: 15,
        rest: 60,
        order: 1,
      },
      {
        routineId: routine5.id,
        exerciseId: flexiones.id,
        sets: 3,
        reps: 15,
        rest: 60,
        order: 2,
      },
      {
        routineId: routine5.id,
        exerciseId: sentadillaSalto.id,
        sets: 3,
        reps: 12,
        rest: 60,
        order: 3,
      },
      {
        routineId: routine5.id,
        exerciseId: plancha.id,
        sets: 3,
        reps: 1,
        rest: 45,
        order: 4,
      },
    ],
  });

  // Routine 6: Personal de athlete2
  const routine6 = await prisma.routine.create({
    data: {
      title: "Mi Rutina Personal",
      description: "Rutina creada por mí mismo",
      userId: athlete2.id,
      createdBy: athlete2.id,
    },
  });

  await prisma.routineExercise.createMany({
    data: [
      {
        routineId: routine6.id,
        exerciseId: dominadas.id,
        sets: 3,
        reps: 8,
        rest: 120,
        order: 1,
      },
      {
        routineId: routine6.id,
        exerciseId: pressMilitar.id,
        sets: 3,
        reps: 10,
        rest: 90,
        order: 2,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Created:");
  console.log(`  - 2 Trainers`);
  console.log(`  - 4 Athletes`);
  console.log(`  - 5 Trainer-Athlete relationships`);
  console.log(`  - 3 User metrics profiles`);
  console.log(`  - 21 Exercises in catalog`);
  console.log(`  - 6 Routines with assigned exercises`);
  console.log("\n🔐 Login credentials (all users):");
  console.log(`  Password: Password123`);
  console.log("\n👨‍🏫 Trainers:");
  console.log(`  - trainer1@gym.com (Carlos Martínez)`);
  console.log(`  - trainer2@gym.com (Ana García)`);
  console.log("\n🏃 Athletes:");
  console.log(`  - athlete1@gym.com (Juan Pérez)`);
  console.log(`  - athlete2@gym.com (María López)`);
  console.log(`  - athlete3@gym.com (Pedro Sánchez)`);
  console.log(`  - athlete4@gym.com (Laura Rodríguez)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });