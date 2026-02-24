const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const DATA_FILE = path.join(__dirname, "projects-data.js");

function slugify(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita tildes
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
}

function loadProjects() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }

    const raw = fs.readFileSync(DATA_FILE, "utf8").trim();

    // Espera formato: window.PROJECTS = [ ... ];
    const match = raw.match(/^window\.PROJECTS\s*=\s*([\s\S]*);\s*$/);
    if (!match) {
        throw new Error(
            "No se pudo leer projects-data.js. Asegúrate de que tenga formato: window.PROJECTS = [...];"
        );
    }

    const jsonPart = match[1];
    const data = JSON.parse(jsonPart);
    if (!Array.isArray(data)) {
        throw new Error("El contenido de projects-data.js no es un array.");
    }

    return data;
}

function saveProjects(projects) {
    const content = `window.PROJECTS = ${JSON.stringify(projects, null, 2)};\n`;
    fs.writeFileSync(DATA_FILE, content, "utf8");
}

async function askRequired(rl, question) {
    let value = "";
    while (!value.trim()) {
        value = await rl.question(question);
        if (!value.trim()) {
            console.log("⚠️  Este campo es obligatorio.");
        }
    }
    return value.trim();
}

async function main() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log("=== Añadir nuevo proyecto al portfolio ===\n");

        const projects = loadProjects();

        let addMore = true;

        while (addMore) {
            const name = await askRequired(rl, "Nombre del proyecto: ");
            const repoUrl = await rl.question("Enlace del repositorio (GitHub, etc.) [opcional]: ");
            const liveUrl = await rl.question("Enlace web del proyecto [opcional]: ");
            const description = await rl.question("Descripción corta [opcional]: ");

            console.log("\n📷 Imágenes");
            console.log(" - Pon SOLO el nombre del archivo");
            console.log(" - Las imágenes deben estar en la carpeta ./imagenes");
            console.log(" - Si hay varias, sepáralas por comas");
            console.log("   Ejemplo: proyecto1.png, proyecto1-2.png, proyecto1-3.jpg\n");

            const imagesInput = await askRequired(rl, "Nombre(s) de archivo(s) de imagen: ");
            const images = imagesInput
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);

            const id = `${slugify(name) || "proyecto"}-${Date.now()}`;

            const newProject = {
                id,
                name,
                repoUrl: repoUrl.trim(),
                liveUrl: liveUrl.trim(),
                images,
                description: description.trim()
            };

            projects.push(newProject);
            saveProjects(projects);

            console.log("\n✅ Proyecto añadido correctamente:");
            console.log(`   - Nombre: ${name}`);
            console.log(`   - ID: ${id}`);
            console.log(`   - Imágenes: ${images.join(", ")}`);
            console.log("\nSe ha actualizado projects-data.js\n");

            const another = await rl.question("¿Quieres añadir otro proyecto? (s/n): ");
            addMore = another.trim().toLowerCase() === "s";
            console.log("");
        }

        console.log("🎉 Listo. Ya puedes abrir tu portfolio y ver las nuevas tarjetas.");
    } catch (error) {
        console.error("\n❌ Error:", error.message);
    } finally {
        rl.close();
    }
}

main();