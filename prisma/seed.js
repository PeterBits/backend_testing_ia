const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
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

  // Create routines for athletes (created by themselves)
  console.log("💪 Creating self-created routines...");
  const routine1 = await prisma.routine.create({
    data: {
      title: "Rutina de Fuerza - Principiante",
      description: "Rutina básica para desarrollar fuerza general",
      userId: athlete1.id,
      createdBy: athlete1.id,
      exercises: {
        create: [
          {
            name: "Sentadillas",
            sets: 3,
            reps: 12,
            rest: 90,
            order: 1,
          },
          {
            name: "Press de Banca",
            sets: 3,
            reps: 10,
            rest: 120,
            order: 2,
          },
          {
            name: "Peso Muerto",
            sets: 3,
            reps: 8,
            rest: 120,
            order: 3,
          },
        ],
      },
    },
  });

  // Create routines assigned by trainers to athletes
  console.log("🎯 Creating trainer-assigned routines...");
  const routine2 = await prisma.routine.create({
    data: {
      title: "Hipertrofia - Tren Superior",
      description: "Rutina de volumen para pecho, espalda y brazos",
      userId: athlete1.id,
      createdBy: trainer1.id,
      exercises: {
        create: [
          {
            name: "Press Inclinado con Mancuernas",
            sets: 4,
            reps: 10,
            rest: 90,
            order: 1,
          },
          {
            name: "Remo con Barra",
            sets: 4,
            reps: 10,
            rest: 90,
            order: 2,
          },
          {
            name: "Curl de Bíceps",
            sets: 3,
            reps: 12,
            rest: 60,
            order: 3,
          },
          {
            name: "Fondos en Paralelas",
            sets: 3,
            reps: 12,
            rest: 60,
            order: 4,
          },
        ],
      },
    },
  });

  const routine3 = await prisma.routine.create({
    data: {
      title: "Hipertrofia - Tren Inferior",
      description: "Rutina de volumen para piernas y glúteos",
      userId: athlete1.id,
      createdBy: trainer1.id,
      exercises: {
        create: [
          {
            name: "Sentadilla Búlgara",
            sets: 4,
            reps: 10,
            rest: 90,
            order: 1,
          },
          {
            name: "Prensa de Piernas",
            sets: 4,
            reps: 12,
            rest: 90,
            order: 2,
          },
          {
            name: "Peso Muerto Rumano",
            sets: 3,
            reps: 10,
            rest: 90,
            order: 3,
          },
          {
            name: "Extensiones de Cuádriceps",
            sets: 3,
            reps: 15,
            rest: 60,
            order: 4,
          },
        ],
      },
    },
  });

  const routine4 = await prisma.routine.create({
    data: {
      title: "Cardio HIIT",
      description: "Entrenamiento de intervalos de alta intensidad",
      userId: athlete2.id,
      createdBy: trainer1.id,
      exercises: {
        create: [
          {
            name: "Burpees",
            sets: 4,
            reps: 15,
            rest: 30,
            order: 1,
          },
          {
            name: "Mountain Climbers",
            sets: 4,
            reps: 20,
            rest: 30,
            order: 2,
          },
          {
            name: "Jumping Jacks",
            sets: 4,
            reps: 30,
            rest: 30,
            order: 3,
          },
          {
            name: "Sprints en Cinta",
            sets: 5,
            reps: 1,
            rest: 60,
            order: 4,
          },
        ],
      },
    },
  });

  const routine5 = await prisma.routine.create({
    data: {
      title: "Funcional - Full Body",
      description: "Entrenamiento funcional de cuerpo completo",
      userId: athlete3.id,
      createdBy: trainer1.id,
      exercises: {
        create: [
          {
            name: "Kettlebell Swings",
            sets: 4,
            reps: 15,
            rest: 60,
            order: 1,
          },
          {
            name: "Flexiones",
            sets: 3,
            reps: 15,
            rest: 60,
            order: 2,
          },
          {
            name: "Sentadillas con Salto",
            sets: 3,
            reps: 12,
            rest: 60,
            order: 3,
          },
          {
            name: "Plancha",
            sets: 3,
            reps: 1,
            rest: 45,
            order: 4,
          },
        ],
      },
    },
  });

  const routine6 = await prisma.routine.create({
    data: {
      title: "Movilidad y Flexibilidad",
      description: "Rutina de estiramiento y movilidad articular",
      userId: athlete3.id,
      createdBy: trainer2.id,
      exercises: {
        create: [
          {
            name: "Estiramiento de Isquiotibiales",
            sets: 3,
            reps: 1,
            rest: 30,
            order: 1,
          },
          {
            name: "Rotaciones de Cadera",
            sets: 3,
            reps: 10,
            rest: 30,
            order: 2,
          },
          {
            name: "Estiramiento de Pectorales",
            sets: 3,
            reps: 1,
            rest: 30,
            order: 3,
          },
          {
            name: "Yoga - Postura del Perro",
            sets: 3,
            reps: 1,
            rest: 30,
            order: 4,
          },
        ],
      },
    },
  });

  const routine7 = await prisma.routine.create({
    data: {
      title: "Pérdida de Grasa - Circuito",
      description: "Circuito de ejercicios para quemar grasa",
      userId: athlete4.id,
      createdBy: trainer2.id,
      exercises: {
        create: [
          {
            name: "Zancadas Alternas",
            sets: 4,
            reps: 20,
            rest: 45,
            order: 1,
          },
          {
            name: "Remo con TRX",
            sets: 4,
            reps: 15,
            rest: 45,
            order: 2,
          },
          {
            name: "Battle Ropes",
            sets: 4,
            reps: 1,
            rest: 45,
            order: 3,
          },
          {
            name: "Box Jumps",
            sets: 4,
            reps: 10,
            rest: 60,
            order: 4,
          },
        ],
      },
    },
  });

  const routine8 = await prisma.routine.create({
    data: {
      title: "Mi Rutina Personal",
      description: "Rutina creada por mí mismo",
      userId: athlete2.id,
      createdBy: athlete2.id,
      exercises: {
        create: [
          {
            name: "Dominadas",
            sets: 3,
            reps: 8,
            rest: 120,
            order: 1,
          },
          {
            name: "Press Militar",
            sets: 3,
            reps: 10,
            rest: 90,
            order: 2,
          },
        ],
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Created:");
  console.log(`  - 2 Trainers`);
  console.log(`  - 4 Athletes`);
  console.log(`  - 5 Trainer-Athlete relationships`);
  console.log(`  - 8 Routines with exercises`);
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