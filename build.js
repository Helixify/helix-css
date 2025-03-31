import fs from "node:fs";
import * as sass from "sass";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define os arquivos SASS que serão compilados
// Separando o arquivo principal dos módulos
const mainFile = "main.scss";
const moduleFiles = [
	"alignment.scss",
	"border.scss",
	"flexbox.scss",
	"form.scss",
	"gap.scss",
	"grid.scss",
	"helper.scss",
	"layout.scss",
	"position.scss",
	"reset.scss",
	"spacing.scss",
	"transition.scss",
	"typography.scss",
];

const outputDir = join(__dirname, "dist");
const modulesDir = join(outputDir, "module");

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

// Compila o arquivo principal (main.scss)
const compileMainSass = async () => {
	const filePath = join(__dirname, "sass", mainFile);
	const fileNameWithoutExt = mainFile.replace(".scss", "");

	// Define os caminhos de saída diretamente no diretório dist
	const expandedOutputPath = join(
		outputDir,
		`${fileNameWithoutExt}.css`,
	);
	const minifiedOutputPath = join(
		outputDir,
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
			`Compiled \`${mainFile}\` to:
      - \`${expandedOutputPath}\`
      - \`${minifiedOutputPath}\``,
		);
	} catch (error) {
		log("error", `Error compiling \`${mainFile}\`: ${error}`);
	}
};

// Compila um arquivo módulo SASS
const compileModuleSass = async (fileName) => {
	const filePath = join(__dirname, "sass", fileName);
	const fileNameWithoutExt = fileName.replace(".scss", "");

	// Define o caminho de saída na pasta modules (apenas versão normal)
	const outputPath = join(
		modulesDir,
		`${fileNameWithoutExt}.css`,
	);

	try {
		// Compila versão expanded
		const result = sass.compile(filePath, {
			style: "expanded",
			sourceMap: true,
		});

		// Salva o arquivo
		await ensureDirectoryExistence(outputPath);
		await fs.promises.writeFile(outputPath, result.css, "utf8");

		if (result.sourceMap) {
			await fs.promises.writeFile(
				`${outputPath}.map`,
				JSON.stringify(result.sourceMap),
				"utf8",
			);
		}

		log(
			"compile",
			`Compiled module \`${fileName}\` to:
      - \`${outputPath}\``,
		);
	} catch (error) {
		log("error", `Error compiling module \`${fileName}\`: ${error}`);
	}
};

// Compila todos os arquivos SASS
const compileAll = async () => {
	try {
		// Primeiro compila o arquivo principal
		await compileMainSass();
		
		// Depois compila todos os módulos
		await Promise.all(moduleFiles.map((file) => compileModuleSass(file)));
		
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

			// Se for o arquivo main.scss
			if (filename === mainFile) {
				await compileMainSass();
			}
			// Se o arquivo alterado está na nossa lista de módulos
			else if (moduleFiles.includes(filename)) {
				await compileModuleSass(filename);
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