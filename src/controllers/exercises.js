const { body, validationResult } = require("express-validator");
const databaseService = require("../services/database");
const { LANGUAGES } = require("../utils/constants");

class ExerciseController {
  /**
   * Get all exercises from the catalog
   * Query params:
   *   - language: Filter exercises by language ID (e.g., 2 for English, 4 for Spanish)
   */
  static async getAllExercises(req, res) {
    try {
      const prisma = databaseService.getClient();
      const { language } = req.query;

      // Build the where clause for filtering
      const whereClause = {};

      // If language filter is provided, only return exercises with that language
      if (language) {
        const languageId = parseInt(language);
        if (isNaN(languageId)) {
          return res.status(400).json({
            error: "Invalid language parameter",
            message: "Language must be a valid integer ID.",
          });
        }

        whereClause.translations = {
          some: {
            language: languageId,
          },
        };
      }

      // Build translations include clause
      // We need to include aliases and notes as they are in separate related tables:
      // - aliases: Alternative names for regional variations (e.g., "Lagartija" vs "Flexión" vs "Plancha")
      //            This enables flexible search across different Spanish-speaking countries
      // - notes: Additional tips, warnings, or instructions for the exercise
      const translationsInclude = {
        include: {
          aliases: true,
          notes: true,
        },
      };

      // If language filter is provided, only include translations in that language
      if (language) {
        translationsInclude.where = {
          language: parseInt(language),
        };
      }

      const exercises = await prisma.exercise.findMany({
        where: whereClause,
        orderBy: { created: "desc" },
        include: {
          category: true,
          license: true,
          muscles: {
            include: {
              muscle: true,
            },
          },
          equipment: {
            include: {
              equipment: true,
            },
          },
          images: {
            orderBy: { isMain: "desc" },
          },
          videos: {
            orderBy: { isMain: "desc" },
          },
          translations: translationsInclude,
        },
      });

      // Transform data to match frontend API structure
      const transformedExercises = exercises.map((exercise) => ({
        id: exercise.id,
        uuid: exercise.uuid,
        created: exercise.created.toISOString(),
        last_update: exercise.lastUpdate.toISOString(),
        last_update_global: exercise.lastUpdateGlobal.toISOString(),
        category: {
          id: exercise.category.id,
          name: exercise.category.name,
        },
        muscles: exercise.muscles
          .filter((m) => m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            name_en: m.muscle.nameEn,
            is_front: m.muscle.isFront,
            image_url_main: m.muscle.imageUrlMain,
            image_url_secondary: m.muscle.imageUrlSecondary,
          })),
        muscles_secondary: exercise.muscles
          .filter((m) => !m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            name_en: m.muscle.nameEn,
            is_front: m.muscle.isFront,
            image_url_main: m.muscle.imageUrlMain,
            image_url_secondary: m.muscle.imageUrlSecondary,
          })),
        equipment: exercise.equipment.map((e) => ({
          id: e.equipment.id,
          name: e.equipment.name,
        })),
        license: {
          id: exercise.license.id,
          full_name: exercise.license.fullName,
          short_name: exercise.license.shortName,
          url: exercise.license.url,
        },
        license_author: exercise.licenseAuthor,
        images: exercise.images.map((img) => ({
          id: img.id,
          uuid: img.uuid,
          image: img.image,
          is_main: img.isMain,
          style: img.style,
          license: img.licenseId,
          license_title: img.licenseTitle,
          license_object_url: img.licenseObjectUrl,
          license_author: img.licenseAuthor,
          license_author_url: img.licenseAuthorUrl,
          license_derivative_source_url: img.licenseDerivativeSourceUrl,
          author_history: JSON.parse(img.authorHistory || "[]"),
        })),
        videos: exercise.videos.map((vid) => ({
          id: vid.id,
          uuid: vid.uuid,
          video: vid.video,
          is_main: vid.isMain,
          size: vid.size,
          duration: vid.duration,
          width: vid.width,
          height: vid.height,
          codec: vid.codec,
          codec_long: vid.codecLong,
          license: vid.licenseId,
          license_title: vid.licenseTitle,
          license_object_url: vid.licenseObjectUrl,
          license_author: vid.licenseAuthor,
          license_author_url: vid.licenseAuthorUrl,
          license_derivative_source_url: vid.licenseDerivativeSourceUrl,
          author_history: JSON.parse(vid.authorHistory || "[]"),
        })),
        translations: exercise.translations.map((trans) => ({
          id: trans.id,
          uuid: trans.uuid,
          name: trans.name,
          exercise: trans.exerciseId,
          description: trans.description,
          created: trans.created.toISOString(),
          language: trans.language,
          aliases: trans.aliases.map((alias) => ({
            id: alias.id,
            uuid: alias.uuid,
            alias: alias.alias,
          })),
          notes: trans.notes.map((note) => ({
            id: note.id,
            uuid: note.uuid,
            translation: note.translationId,
            comment: note.comment,
          })),
          license: trans.licenseId,
          license_title: trans.licenseTitle,
          license_object_url: trans.licenseObjectUrl,
          license_author: trans.licenseAuthor,
          license_author_url: trans.licenseAuthorUrl,
          license_derivative_source_url: trans.licenseDerivativeSourceUrl,
          author_history: JSON.parse(trans.authorHistory || "[]"),
        })),
      }));

      res.json({
        success: true,
        data: transformedExercises,
        count: transformedExercises.length,
      });
    } catch (error) {
      console.error("Get exercises error:", error);
      res.status(500).json({
        error: "Failed to retrieve exercises",
        message: "An error occurred while fetching exercises.",
      });
    }
  }

  /**
   * Get a specific exercise by ID
   */
  static async getExerciseById(req, res) {
    try {
      const { id } = req.params;
      const prisma = databaseService.getClient();

      const exercise = await prisma.exercise.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
          license: true,
          muscles: {
            include: {
              muscle: true,
            },
          },
          equipment: {
            include: {
              equipment: true,
            },
          },
          images: {
            orderBy: { isMain: "desc" },
          },
          videos: {
            orderBy: { isMain: "desc" },
          },
          translations: {
            include: {
              aliases: true,
              notes: true,
            },
          },
        },
      });

      if (!exercise) {
        return res.status(404).json({
          error: "Exercise not found",
          message: "The requested exercise does not exist.",
        });
      }

      // Transform data to match frontend API structure
      const transformedExercise = {
        id: exercise.id,
        uuid: exercise.uuid,
        created: exercise.created.toISOString(),
        last_update: exercise.lastUpdate.toISOString(),
        last_update_global: exercise.lastUpdateGlobal.toISOString(),
        category: {
          id: exercise.category.id,
          name: exercise.category.name,
        },
        muscles: exercise.muscles
          .filter((m) => m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            name_en: m.muscle.nameEn,
            is_front: m.muscle.isFront,
            image_url_main: m.muscle.imageUrlMain,
            image_url_secondary: m.muscle.imageUrlSecondary,
          })),
        muscles_secondary: exercise.muscles
          .filter((m) => !m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            name_en: m.muscle.nameEn,
            is_front: m.muscle.isFront,
            image_url_main: m.muscle.imageUrlMain,
            image_url_secondary: m.muscle.imageUrlSecondary,
          })),
        equipment: exercise.equipment.map((e) => ({
          id: e.equipment.id,
          name: e.equipment.name,
        })),
        license: {
          id: exercise.license.id,
          full_name: exercise.license.fullName,
          short_name: exercise.license.shortName,
          url: exercise.license.url,
        },
        license_author: exercise.licenseAuthor,
        images: exercise.images.map((img) => ({
          id: img.id,
          uuid: img.uuid,
          image: img.image,
          is_main: img.isMain,
          style: img.style,
          license: img.licenseId,
          license_title: img.licenseTitle,
          license_object_url: img.licenseObjectUrl,
          license_author: img.licenseAuthor,
          license_author_url: img.licenseAuthorUrl,
          license_derivative_source_url: img.licenseDerivativeSourceUrl,
          author_history: JSON.parse(img.authorHistory || "[]"),
        })),
        videos: exercise.videos.map((vid) => ({
          id: vid.id,
          uuid: vid.uuid,
          video: vid.video,
          is_main: vid.isMain,
          size: vid.size,
          duration: vid.duration,
          width: vid.width,
          height: vid.height,
          codec: vid.codec,
          codec_long: vid.codecLong,
          license: vid.licenseId,
          license_title: vid.licenseTitle,
          license_object_url: vid.licenseObjectUrl,
          license_author: vid.licenseAuthor,
          license_author_url: vid.licenseAuthorUrl,
          license_derivative_source_url: vid.licenseDerivativeSourceUrl,
          author_history: JSON.parse(vid.authorHistory || "[]"),
        })),
        translations: exercise.translations.map((trans) => ({
          id: trans.id,
          uuid: trans.uuid,
          name: trans.name,
          exercise: trans.exerciseId,
          description: trans.description,
          created: trans.created.toISOString(),
          language: trans.language,
          aliases: trans.aliases.map((alias) => ({
            id: alias.id,
            uuid: alias.uuid,
            alias: alias.alias,
          })),
          notes: trans.notes.map((note) => ({
            id: note.id,
            uuid: note.uuid,
            translation: note.translationId,
            comment: note.comment,
          })),
          license: trans.licenseId,
          license_title: trans.licenseTitle,
          license_object_url: trans.licenseObjectUrl,
          license_author: trans.licenseAuthor,
          license_author_url: trans.licenseAuthorUrl,
          license_derivative_source_url: trans.licenseDerivativeSourceUrl,
          author_history: JSON.parse(trans.authorHistory || "[]"),
        })),
      };

      res.json({
        success: true,
        data: transformedExercise,
      });
    } catch (error) {
      console.error("Get exercise error:", error);
      res.status(500).json({
        error: "Failed to retrieve exercise",
        message: "An error occurred while fetching the exercise.",
      });
    }
  }

  /**
   * Create a new exercise (for admin features)
   * Note: This is a complex operation that requires category, license, and translation data
   */
  static async createExercise(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data.",
          details: errors.array(),
        });
      }

      const {
        categoryId,
        licenseId,
        licenseAuthor,
        translations,
        muscles,
        musclesSecondary,
        equipment,
        images,
        videos,
      } = req.body;

      const prisma = databaseService.getClient();

      // Validate required relations exist
      const category = await prisma.exerciseCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({
          error: "Invalid category",
          message: "The specified category does not exist.",
        });
      }

      const license = await prisma.exerciseLicense.findUnique({
        where: { id: licenseId },
      });
      if (!license) {
        return res.status(400).json({
          error: "Invalid license",
          message: "The specified license does not exist.",
        });
      }

      // Create exercise with all relations in a transaction
      const exercise = await prisma.$transaction(async (tx) => {
        // Create the base exercise
        const newExercise = await tx.exercise.create({
          data: {
            categoryId,
            licenseId,
            licenseAuthor: licenseAuthor || null,
          },
        });

        // Create muscle relations (primary)
        if (muscles && muscles.length > 0) {
          await tx.exerciseMuscleRelation.createMany({
            data: muscles.map((muscleId) => ({
              exerciseId: newExercise.id,
              muscleId,
              isPrimary: true,
            })),
          });
        }

        // Create muscle relations (secondary)
        if (musclesSecondary && musclesSecondary.length > 0) {
          await tx.exerciseMuscleRelation.createMany({
            data: musclesSecondary.map((muscleId) => ({
              exerciseId: newExercise.id,
              muscleId: muscleId,
              isPrimary: false,
            })),
          });
        }

        // Create equipment relations
        if (equipment && equipment.length > 0) {
          await tx.exerciseEquipmentRelation.createMany({
            data: equipment.map((equipmentId) => ({
              exerciseId: newExercise.id,
              equipmentId,
            })),
          });
        }

        // Create translations
        if (translations && translations.length > 0) {
          for (const trans of translations) {
            const translation = await tx.exerciseTranslation.create({
              data: {
                exerciseId: newExercise.id,
                name: trans.name,
                description: trans.description,
                language: trans.language,
                licenseId: trans.licenseId,
                licenseTitle: trans.licenseTitle,
                licenseObjectUrl: trans.licenseObjectUrl,
                licenseAuthor: trans.licenseAuthor || null,
                licenseAuthorUrl: trans.licenseAuthorUrl,
                licenseDerivativeSourceUrl: trans.licenseDerivativeSourceUrl,
                authorHistory: JSON.stringify(trans.authorHistory || []),
              },
            });

            // Create aliases for this translation
            // Aliases are alternative names for the same exercise in a specific language
            // Examples: "Lagartija", "Flexión", "Plancha" for push-ups in Spanish
            // This enables users from different regions to find exercises using local terminology
            if (trans.aliases && trans.aliases.length > 0) {
              await tx.exerciseTranslationAlias.createMany({
                data: trans.aliases.map((alias) => ({
                  translationId: translation.id,
                  alias,
                })),
              });
            }

            // Create notes for this translation
            // Notes contain additional tips, warnings, or execution instructions
            // Examples: "Keep core engaged", "Don't arch your back"
            if (trans.notes && trans.notes.length > 0) {
              await tx.exerciseNote.createMany({
                data: trans.notes.map((note) => ({
                  translationId: translation.id,
                  comment: note,
                })),
              });
            }
          }
        }

        // Create images
        if (images && images.length > 0) {
          await tx.exerciseImage.createMany({
            data: images.map((img) => ({
              exerciseId: newExercise.id,
              image: img.image,
              isMain: img.isMain || false,
              style: img.style,
              licenseId: img.licenseId,
              licenseTitle: img.licenseTitle,
              licenseObjectUrl: img.licenseObjectUrl,
              licenseAuthor: img.licenseAuthor || null,
              licenseAuthorUrl: img.licenseAuthorUrl,
              licenseDerivativeSourceUrl: img.licenseDerivativeSourceUrl,
              authorHistory: JSON.stringify(img.authorHistory || []),
            })),
          });
        }

        // Create videos
        if (videos && videos.length > 0) {
          await tx.exerciseVideo.createMany({
            data: videos.map((vid) => ({
              exerciseId: newExercise.id,
              video: vid.video,
              isMain: vid.isMain || false,
              size: vid.size,
              duration: vid.duration,
              width: vid.width,
              height: vid.height,
              codec: vid.codec,
              codecLong: vid.codecLong,
              licenseId: vid.licenseId,
              licenseTitle: vid.licenseTitle,
              licenseObjectUrl: vid.licenseObjectUrl,
              licenseAuthor: vid.licenseAuthor || null,
              licenseAuthorUrl: vid.licenseAuthorUrl,
              licenseDerivativeSourceUrl: vid.licenseDerivativeSourceUrl,
              authorHistory: JSON.stringify(vid.authorHistory || []),
            })),
          });
        }

        return newExercise;
      });

      // Fetch the complete exercise with all relations
      const completeExercise = await prisma.exercise.findUnique({
        where: { id: exercise.id },
        include: {
          category: true,
          license: true,
          muscles: {
            include: { muscle: true },
          },
          equipment: {
            include: { equipment: true },
          },
          images: {
            orderBy: { isMain: "desc" },
          },
          videos: {
            orderBy: { isMain: "desc" },
          },
          translations: {
            include: {
              aliases: true,
              notes: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Exercise created successfully",
        data: completeExercise,
      });
    } catch (error) {
      console.error("Create exercise error:", error);
      res.status(500).json({
        error: "Failed to create exercise",
        message: "An error occurred while creating the exercise.",
      });
    }
  }
}

// Validation middleware for creating exercises
const exerciseValidation = [
  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("Valid category ID is required"),
  body("licenseId")
    .isInt({ min: 1 })
    .withMessage("Valid license ID is required"),
  body("licenseAuthor")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("License author must not exceed 200 characters"),
  body("muscles")
    .optional()
    .isArray()
    .withMessage("Muscles must be an array"),
  body("muscles.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each muscle ID must be a valid integer"),
  body("musclesSecondary")
    .optional()
    .isArray()
    .withMessage("Secondary muscles must be an array"),
  body("musclesSecondary.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each secondary muscle ID must be a valid integer"),
  body("equipment")
    .optional()
    .isArray()
    .withMessage("Equipment must be an array"),
  body("equipment.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each equipment ID must be a valid integer"),
  body("translations")
    .optional()
    .isArray()
    .withMessage("Translations must be an array"),
  body("translations.*.name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Translation name must be between 1 and 200 characters"),
  body("translations.*.description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Translation description must not exceed 2000 characters"),
  body("translations.*.language")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Language ID must be a valid integer"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("videos")
    .optional()
    .isArray()
    .withMessage("Videos must be an array"),
];

module.exports = {
  ExerciseController,
  exerciseValidation,
};
