const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.sessionExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.exerciseNote.deleteMany();
  await prisma.exerciseTranslationAlias.deleteMany();
  await prisma.exerciseTranslation.deleteMany();
  await prisma.exerciseImage.deleteMany();
  await prisma.exerciseVideo.deleteMany();
  await prisma.exerciseMuscleRelation.deleteMany();
  await prisma.exerciseEquipmentRelation.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.exerciseCategory.deleteMany();
  await prisma.exerciseMuscle.deleteMany();
  await prisma.exerciseEquipment.deleteMany();
  await prisma.exerciseLicense.deleteMany();
  await prisma.trainerAthlete.deleteMany();
  await prisma.userMetrics.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users (same password for simplicity in development)
  const hashedPassword = await bcrypt.hash("Password123", 12);
  const adminPassword = await bcrypt.hash("admin1", 12);

  // Create Admin User
  console.log("👑 Creating admin user...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      password: adminPassword,
      name: "Admin",
      role: "TRAINER",
    },
  });

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

  // Load exercises from JSON file
  console.log("📚 Loading exercise catalog from JSON...");
  const exercisesJsonPath = path.join(__dirname, "exercicies_mock.json");
  const allExercisesData = JSON.parse(
    fs.readFileSync(exercisesJsonPath, "utf8")
  );

  // Language constants (English = 2, Spanish = 4)
  const ENGLISH = 2;
  const SPANISH = 4;

  // Filter exercises: only keep those with English OR Spanish translations
  const exercisesData = allExercisesData.filter((ex) => {
    return (
      ex.translations &&
      ex.translations.length > 0 &&
      ex.translations.some(
        (trans) => trans.language === ENGLISH || trans.language === SPANISH
      )
    );
  });

  console.log(
    `📊 Filtered ${allExercisesData.length} exercises down to ${exercisesData.length} with English or Spanish translations`
  );

  // Create maps to track created entities by their original IDs
  const categoryMap = new Map();
  const licenseMap = new Map();
  const muscleMap = new Map();
  const equipmentMap = new Map();
  const exerciseMap = new Map();

  // Extract unique categories
  console.log("📦 Creating exercise categories...");
  const categories = [
    ...new Map(
      exercisesData.map((ex) => [ex.category.id, ex.category])
    ).values(),
  ];
  for (const cat of categories) {
    const created = await prisma.exerciseCategory.create({
      data: { name: cat.name },
    });
    categoryMap.set(cat.id, created.id);
  }

  // Extract unique licenses
  console.log("📜 Creating exercise licenses...");
  const licenses = [
    ...new Map(
      exercisesData.map((ex) => [ex.license.id, ex.license])
    ).values(),
  ];
  for (const lic of licenses) {
    const created = await prisma.exerciseLicense.create({
      data: {
        fullName: lic.full_name,
        shortName: lic.short_name,
        url: lic.url,
      },
    });
    licenseMap.set(lic.id, created.id);
  }

  // Extract unique muscles
  console.log("💪 Creating muscles...");
  const musclesSet = new Map();
  exercisesData.forEach((ex) => {
    ex.muscles.forEach((m) => musclesSet.set(m.id, m));
    ex.muscles_secondary.forEach((m) => musclesSet.set(m.id, m));
  });
  for (const muscle of musclesSet.values()) {
    const created = await prisma.exerciseMuscle.create({
      data: {
        name: muscle.name,
        nameEn: muscle.name_en,
        isFront: muscle.is_front,
        imageUrlMain: muscle.image_url_main,
        imageUrlSecondary: muscle.image_url_secondary,
      },
    });
    muscleMap.set(muscle.id, created.id);
  }

  // Extract unique equipment
  console.log("🏋️ Creating equipment...");
  const equipmentSet = new Map();
  exercisesData.forEach((ex) => {
    ex.equipment.forEach((eq) => equipmentSet.set(eq.id, eq));
  });
  for (const equip of equipmentSet.values()) {
    const created = await prisma.exerciseEquipment.create({
      data: { name: equip.name },
    });
    equipmentMap.set(equip.id, created.id);
  }

  // Create exercises with all relations
  console.log("🎯 Creating exercises with relations...");
  for (const ex of exercisesData) {
    const exercise = await prisma.exercise.create({
      data: {
        uuid: ex.uuid,
        created: new Date(ex.created),
        lastUpdate: new Date(ex.last_update),
        lastUpdateGlobal: new Date(ex.last_update_global),
        categoryId: categoryMap.get(ex.category.id),
        licenseId: licenseMap.get(ex.license.id),
        licenseAuthor: ex.license_author,
      },
    });
    exerciseMap.set(ex.id, exercise.id);

    // Create muscle relations (primary)
    if (ex.muscles && ex.muscles.length > 0) {
      await prisma.exerciseMuscleRelation.createMany({
        data: ex.muscles.map((m) => ({
          exerciseId: exercise.id,
          muscleId: muscleMap.get(m.id),
          isPrimary: true,
        })),
      });
    }

    // Create muscle relations (secondary)
    if (ex.muscles_secondary && ex.muscles_secondary.length > 0) {
      await prisma.exerciseMuscleRelation.createMany({
        data: ex.muscles_secondary.map((m) => ({
          exerciseId: exercise.id,
          muscleId: muscleMap.get(m.id),
          isPrimary: false,
        })),
      });
    }

    // Create equipment relations
    if (ex.equipment && ex.equipment.length > 0) {
      await prisma.exerciseEquipmentRelation.createMany({
        data: ex.equipment.map((eq) => ({
          exerciseId: exercise.id,
          equipmentId: equipmentMap.get(eq.id),
        })),
      });
    }

    // Create images
    if (ex.images && ex.images.length > 0) {
      await prisma.exerciseImage.createMany({
        data: ex.images.map((img) => ({
          uuid: img.uuid,
          exerciseId: exercise.id,
          image: img.image,
          isMain: img.is_main,
          style: img.style,
          licenseId: licenseMap.get(img.license),
          licenseTitle: img.license_title,
          licenseObjectUrl: img.license_object_url,
          licenseAuthor: img.license_author,
          licenseAuthorUrl: img.license_author_url,
          licenseDerivativeSourceUrl: img.license_derivative_source_url,
          authorHistory: JSON.stringify(img.author_history || []),
        })),
      });
    }

    // Create videos
    if (ex.videos && ex.videos.length > 0) {
      await prisma.exerciseVideo.createMany({
        data: ex.videos.map((vid) => ({
          uuid: vid.uuid,
          exerciseId: exercise.id,
          video: vid.video,
          isMain: vid.is_main,
          size: vid.size,
          duration: vid.duration,
          width: vid.width,
          height: vid.height,
          codec: vid.codec,
          codecLong: vid.codec_long,
          licenseId: licenseMap.get(vid.license),
          licenseTitle: vid.license_title,
          licenseObjectUrl: vid.license_object_url,
          licenseAuthor: vid.license_author,
          licenseAuthorUrl: vid.license_author_url,
          licenseDerivativeSourceUrl: vid.license_derivative_source_url,
          authorHistory: JSON.stringify(vid.author_history || []),
        })),
      });
    }

    // Create translations
    if (ex.translations && ex.translations.length > 0) {
      for (const trans of ex.translations) {
        const translation = await prisma.exerciseTranslation.create({
          data: {
            uuid: trans.uuid,
            exerciseId: exercise.id,
            name: trans.name,
            description: trans.description,
            created: new Date(trans.created),
            language: trans.language,
            licenseId: licenseMap.get(trans.license),
            licenseTitle: trans.license_title,
            licenseObjectUrl: trans.license_object_url,
            licenseAuthor: trans.license_author,
            licenseAuthorUrl: trans.license_author_url,
            licenseDerivativeSourceUrl: trans.license_derivative_source_url,
            authorHistory: JSON.stringify(trans.author_history || []),
          },
        });

        // Create aliases
        if (trans.aliases && trans.aliases.length > 0) {
          await prisma.exerciseTranslationAlias.createMany({
            data: trans.aliases.map((alias) => ({
              uuid: alias.uuid,
              translationId: translation.id,
              alias: alias.alias,
            })),
          });
        }

        // Create notes
        if (trans.notes && trans.notes.length > 0) {
          await prisma.exerciseNote.createMany({
            data: trans.notes.map((note) => ({
              uuid: note.uuid,
              translationId: translation.id,
              comment: note.comment,
            })),
          });
        }
      }
    }
  }

  console.log(
    `✅ Created ${exercisesData.length} exercises with all relations`
  );

  // For routines, use the first exercise with a Spanish translation
  const firstExerciseWithSpanish = exercisesData.find((ex) =>
    ex.translations.some((t) => t.language === 4)
  );
  const firstExerciseId = exerciseMap.get(firstExerciseWithSpanish.id);

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
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 12,
        weight: 60,
        rest: 90,
        order: 1,
      },
      {
        routineId: routine1.id,
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 10,
        weight: 40,
        rest: 120,
        order: 2,
      },
      {
        routineId: routine1.id,
        exerciseId: firstExerciseId,
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
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 10,
        rest: 90,
        order: 1,
      },
      {
        routineId: routine2.id,
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 10,
        rest: 90,
        order: 2,
      },
      {
        routineId: routine2.id,
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 12,
        rest: 60,
        order: 3,
      },
      {
        routineId: routine2.id,
        exerciseId: firstExerciseId,
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
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 10,
        rest: 90,
        order: 1,
      },
      {
        routineId: routine3.id,
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 12,
        rest: 90,
        order: 2,
      },
      {
        routineId: routine3.id,
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 10,
        rest: 90,
        order: 3,
      },
      {
        routineId: routine3.id,
        exerciseId: firstExerciseId,
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
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 15,
        rest: 30,
        order: 1,
      },
      {
        routineId: routine4.id,
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 20,
        rest: 30,
        order: 2,
      },
      {
        routineId: routine4.id,
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 30,
        rest: 30,
        order: 3,
      },
      {
        routineId: routine4.id,
        exerciseId: firstExerciseId,
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
        exerciseId: firstExerciseId,
        sets: 4,
        reps: 15,
        rest: 60,
        order: 1,
      },
      {
        routineId: routine5.id,
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 15,
        rest: 60,
        order: 2,
      },
      {
        routineId: routine5.id,
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 12,
        rest: 60,
        order: 3,
      },
      {
        routineId: routine5.id,
        exerciseId: firstExerciseId,
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
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 8,
        rest: 120,
        order: 1,
      },
      {
        routineId: routine6.id,
        exerciseId: firstExerciseId,
        sets: 3,
        reps: 10,
        rest: 90,
        order: 2,
      },
    ],
  });

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Created:");
  console.log(`  - 1 Admin`);
  console.log(`  - 2 Trainers`);
  console.log(`  - 4 Athletes`);
  console.log(`  - 5 Trainer-Athlete relationships`);
  console.log(`  - 3 User metrics profiles`);
  console.log(`  - ${categories.length} Exercise categories`);
  console.log(`  - ${licenses.length} Exercise licenses`);
  console.log(`  - ${musclesSet.size} Muscles`);
  console.log(`  - ${equipmentSet.size} Equipment types`);
  console.log(`  - ${exercisesData.length} Exercises with full details`);
  console.log(`  - 6 Routines with assigned exercises`);
  console.log("\n🔐 Login credentials:");
  console.log("\n👑 Admin:");
  console.log(`  - admin@admin.com / admin1`);
  console.log("\n👨‍🏫 Trainers (Password: Password123):");
  console.log(`  - trainer1@gym.com (Carlos Martínez)`);
  console.log(`  - trainer2@gym.com (Ana García)`);
  console.log("\n🏃 Athletes (Password: Password123):");
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
