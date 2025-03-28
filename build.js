import fs from "node:fs";
import * as sass from "sass";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define os arquivos SASS que serão compilados
// const sassFiles = [
// 	"alignment.scss", 
// 	"border.scss", 
// 	"flexbox.scss", 
// 	"form.scss", 
// 	"gap.scss", 
// 	"grid.scss", 
// 	"helper.scss", 
// 	"layout.scss", 
// 	"main.scss", 
// 	"position.scss", 
// 	"reset.scss", 
// 	"spacing.scss", 
// 	"transition.scss", 
// 	"typography.scss"];
const sassFiles = ["main.scss", "grid.scss"];

const outputDir = join(__dirname, "dist");

const log = async (type, message) => {
	let typeText;

	switch (type) {
		case "info":
			typeText = "Info";
			break;
		case "error":
			typeText = "Error";
			break;
		case "success":
			typeText = "Success";
			break;
		case "compile":
			typeText = "Compile";
			break;
		case "watch":
			typeText = "Watch";
			break;
		default:
			typeText = "Log";
	}

	const formattedMessage = message.replace(/`([^`]+)`/g, "\x1b[36m$1\x1b[0m");
	console.log(`${typeText}: ${formattedMessage}`);
};

// Garante que o diretório existe
const ensureDirectoryExistence = async (filePath) => {
	const dir = dirname(filePath);
	try {
		await fs.promises.access(dir, fs.constants.F_OK);
	} catch {
		await fs.promises.mkdir(dir, { recursive: true });
	}
};

// Compila um arquivo SASS
const compileSass = async (fileName) => {
	const filePath = join(__dirname, "sass", fileName);
	const fileNameWithoutExt = fileName.replace(".scss", "");

	// Define os caminhos de saída para versões expanded e compressed
	const expandedOutputPath = join(
		outputDir,
		"expanded",
		`${fileNameWithoutExt}.css`,
	);
	const minifiedOutputPath = join(
		outputDir,
		"compressed",
		`${fileNameWithoutExt}.min.css`,
	);

	try {
		// Compila versão expanded
		const expandedResult = sass.compile(filePath, {
			style: "expanded",
			sourceMap: true,
		});

		// Compila versão compressed
		const compressedResult = sass.compile(filePath, {
			style: "compressed",
			sourceMap: false,
		});

		// Salva versão expanded
		await ensureDirectoryExistence(expandedOutputPath);
		await fs.promises.writeFile(expandedOutputPath, expandedResult.css, "utf8");

		if (expandedResult.sourceMap) {
			await fs.promises.writeFile(
				`${expandedOutputPath}.map`,
				JSON.stringify(expandedResult.sourceMap),
				"utf8",
			);
		}

		// Salva versão compressed
		await ensureDirectoryExistence(minifiedOutputPath);
		await fs.promises.writeFile(
			minifiedOutputPath,
			compressedResult.css,
			"utf8",
		);

		log(
			"compile",
			`Compiled \`${fileName}\` to:
      - \`${expandedOutputPath}\`
      - \`${minifiedOutputPath}\``,
		);
	} catch (error) {
		log("error", `Error compiling \`${fileName}\`: ${error}`);
	}
};

// Compila todos os arquivos SASS
const compileAll = async () => {
	try {
		await Promise.all(sassFiles.map((file) => compileSass(file)));
		log("success", "All SASS files compiled successfully");
	} catch (error) {
		log("error", `Error in compilation process: ${error}`);
	}
};

// Observa mudanças nos arquivos
const watchFiles = () => {
	log("watch", "Watching for file changes...");

	const sassDir = join(__dirname, "sass");

	fs.watch(sassDir, { recursive: true }, async (_eventType, filename) => {
		if (filename?.endsWith(".scss")) {
			log("info", `File \`${filename}\` changed`);

			// Se o arquivo alterado está na nossa lista, compila ele
			if (sassFiles.includes(filename)) {
				await compileSass(filename);
			}
			// Se for um arquivo parcial (_filename.scss), recompila tudo
			else if (filename.startsWith("_")) {
				log("info", "Partial file changed, recompiling all files...");
				await compileAll();
			}
		}
	});
};

// Execução principal
if (process.argv.includes("--watch")) {
	compileAll()
		.then(watchFiles)
		.catch((error) => {
			log("error", `Error in watch process: ${error}`);
		});
} else {
	compileAll().catch((error) => {
		log("error", `Error in compilation process: ${error}`);
	});
}
