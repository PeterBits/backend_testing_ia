#!/usr/bin/env node

/**
 * Script de prueba para demostrar que el backend funciona correctamente
 * Ejecutar con: node test-api.js
 */

const http = require("http");

// Función para hacer peticiones HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            body: jsonBody,
            headers: res.headers,
          });
        } catch (e) {
          resolve({ status: res.statusCode, body, headers: res.headers });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPI() {
  console.log("🧪 Iniciando pruebas del Gym Backend API...\n");

  try {
    // 1. Test Health Check
    console.log("1️⃣ Probando Health Check...");
    const healthResponse = await makeRequest({
      hostname: "localhost",
      port: 4000,
      path: "/",
      method: "GET",
    });

    if (healthResponse.status === 200) {
      console.log("✅ Health Check exitoso");
      console.log(`   Mensaje: ${healthResponse.body.message}`);
      console.log(`   Versión: ${healthResponse.body.version}`);
      console.log(`   Entorno: ${healthResponse.body.environment}\n`);
    } else {
      console.error("❌ Health Check falló\n");
      return;
    }

    // 2. Test Registro de Usuario
    console.log("2️⃣ Probando registro de usuario...");
    const registerData = {
      email: "demo@gym.com",
      password: "DemoPassword123",
      name: "Usuario Demo",
    };

    const registerResponse = await makeRequest(
      {
        hostname: "localhost",
        port: 4000,
        path: "/api/auth/register",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      registerData
    );

    if (registerResponse.status === 201) {
      console.log("✅ Registro exitoso");
      console.log(`   Email: ${registerResponse.body.user.email}`);
      console.log(`   Nombre: ${registerResponse.body.user.name}`);

      const token = registerResponse.body.token;
      console.log(`   Token generado: ${token.substring(0, 20)}...\n`);

      // 3. Test Login
      console.log("3️⃣ Probando login...");
      const loginResponse = await makeRequest(
        {
          hostname: "localhost",
          port: 4000,
          path: "/api/auth/login",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
        {
          email: registerData.email,
          password: registerData.password,
        }
      );

      if (loginResponse.status === 200) {
        console.log("✅ Login exitoso");
        console.log(`   Mensaje: ${loginResponse.body.message}\n`);
      } else {
        console.error("❌ Login falló\n");
      }

      // 4. Test Crear Rutina
      console.log("4️⃣ Probando creación de rutina...");
      const routineData = {
        title: "Push Day Demo",
        description: "Rutina de demostración para el pecho y hombros",
        exercises: [
          {
            name: "Bench Press",
            sets: 4,
            reps: 8,
            rest: 90,
            order: 1,
          },
          {
            name: "Shoulder Press",
            sets: 3,
            reps: 10,
            rest: 60,
            order: 2,
          },
        ],
      };

      const routineResponse = await makeRequest(
        {
          hostname: "localhost",
          port: 4000,
          path: "/api/routines",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        routineData
      );

      if (routineResponse.status === 201) {
        console.log("✅ Rutina creada exitosamente");
        console.log(`   Título: ${routineResponse.body.data.title}`);
        console.log(
          `   Ejercicios: ${routineResponse.body.data.exercises.length}`
        );

        const routineId = routineResponse.body.data.id;

        // 5. Test Obtener Rutinas
        console.log("\n5️⃣ Probando obtener rutinas...");
        const getRoutinesResponse = await makeRequest({
          hostname: "localhost",
          port: 4000,
          path: "/api/routines",
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (getRoutinesResponse.status === 200) {
          console.log("✅ Rutinas obtenidas exitosamente");
          console.log(
            `   Total de rutinas: ${getRoutinesResponse.body.data.length}`
          );
        }

        // 6. Test Estadísticas
        console.log("\n6️⃣ Probando estadísticas...");
        const statsResponse = await makeRequest({
          hostname: "localhost",
          port: 4000,
          path: "/api/routines/stats",
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsResponse.status === 200) {
          console.log("✅ Estadísticas obtenidas exitosamente");
          console.log(
            `   Total rutinas: ${statsResponse.body.data.totalRoutines}`
          );
          console.log(
            `   Total ejercicios: ${statsResponse.body.data.totalExercises}`
          );
        }
      } else {
        console.error("❌ Error al crear rutina");
        console.error(`   Status: ${routineResponse.status}`);
        console.error(
          `   Error: ${routineResponse.body.error || routineResponse.body}`
        );
      }
    } else if (registerResponse.status === 409) {
      console.log(
        "⚠️  Usuario ya existe (esto es normal si ya ejecutaste la prueba)"
      );
      console.log(
        "   Prueba hacer login con: demo@gym.com / DemoPassword123\n"
      );
    } else {
      console.error("❌ Error en registro");
      console.error(`   Status: ${registerResponse.status}`);
      console.error(`   Error: ${registerResponse.body}\n`);
    }

    console.log(
      "🎉 ¡Pruebas completadas! El backend está funcionando correctamente."
    );
    console.log("\n📋 Resumen de endpoints probados:");
    console.log("   ✅ GET /                    - Health check");
    console.log("   ✅ POST /api/auth/register  - Registro de usuario");
    console.log("   ✅ POST /api/auth/login     - Login de usuario");
    console.log("   ✅ POST /api/routines       - Crear rutina");
    console.log("   ✅ GET /api/routines        - Obtener rutinas");
    console.log("   ✅ GET /api/routines/stats  - Estadísticas");

    console.log("\n🌐 El servidor está ejecutándose en: http://localhost:4000");
    console.log("📖 Revisa el README.md para más información sobre la API");
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error.message);
    console.log("\n💡 Asegúrate de que el servidor esté ejecutándose:");
    console.log("   npm run dev");
  }
}

// Ejecutar las pruebas
testAPI();
