// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs/promises';

// Lista de módulos disponíveis (arquivos SCSS individuais)
const modules = [
  'alignment',
  'border',
  'flexbox',
  'form',
  'gap',
  'grid',
  'helper',
  'layout',
  'position',
  'reset',
  'spacing',
  'transition',
  'typography',
];

export default defineConfig({
  // Previne que o Vite copie arquivos do diretório public para dist
  publicDir: false,
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Precisamos desativar a geração de sourcemap aqui para controlar manualmente
    sourcemap: false,
    
    rollupOptions: {
      // Especificamos apenas o main.scss como entrada
      input: resolve(__dirname, 'sass/main.scss'),
      
      output: {
        // Configuração específica para saída
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'main.css';
          }
          return `assets/${assetInfo.name}`;
        },
        // Garantir que não se tente adicionar sufixos numéricos em caso de múltiplos assets
        entryFileNames: 'ignored-[name].js',
      },
    },
    
    // Desativa a minificação nativa - vamos fazer isso manualmente
    minify: false,
  },
  
  css: {
    // Configurações do preprocessador SCSS
    preprocessorOptions: {
      scss: {
        // Adicione quaisquer configurações necessárias do Sass aqui
      }
    },
    // Desativamos aqui também o devSourcemap e o trataremos manualmente
    devSourcemap: false,
  },
  
  plugins: [
    // Plugin para processar o arquivo main.scss e gerar sourcemap
    {
      name: 'process-main-scss',
      closeBundle: async () => {
        // Importa sass dinamicamente
        const sass = await import('sass');
        
        try {
          // Compila o arquivo main.scss diretamente com o compilador sass
          const result = sass.compile(resolve(__dirname, 'sass/main.scss'), {
            style: 'expanded',
            sourceMap: true,
          });
          
          // Caminho para o arquivo main.css
          const mainCssPath = resolve(__dirname, 'dist/main.css');
          
          // Escreve o CSS compilado
          await fs.writeFile(mainCssPath, result.css, 'utf8');
          
          // Escreve o sourcemap
          if (result.sourceMap) {
            const sourcemapPath = `${mainCssPath}.map`;
            await fs.writeFile(
              sourcemapPath,
              JSON.stringify(result.sourceMap),
              'utf8'
            );
            
            // Adiciona a referência ao sourcemap no arquivo CSS
            await fs.appendFile(
              mainCssPath,
              '\n/*# sourceMappingURL=main.css.map */',
              'utf8'
            );
            
            console.log('✓ Generated main.css and main.css.map');
          }
        } catch (error) {
          console.error('✗ Error processing main.scss:', error);
        }
      }
    },
    
    // Plugin para compilar módulos individuais
    {
      name: 'compile-individual-modules',
      closeBundle: async () => {
        // Importa sass dinamicamente (se ainda não importado)
        const sass = await import('sass');
        
        // Garante que o diretório de módulos existe
        await fs.mkdir(resolve(__dirname, 'dist/module'), { recursive: true });
        
        // Compila cada módulo individualmente
        for (const moduleName of modules) {
          try {
            // Compila o módulo com Sass
            const result = sass.compile(
              resolve(__dirname, `sass/${moduleName}.scss`), 
              {
                style: 'expanded',
                sourceMap: true,
              }
            );
            
            // Caminho de saída para o módulo
            const outputPath = resolve(__dirname, `dist/module/${moduleName}.css`);
            
            // Escreve o CSS compilado
            await fs.writeFile(outputPath, result.css, 'utf8');
            
            // Escreve o sourcemap
            if (result.sourceMap) {
              await fs.writeFile(
                `${outputPath}.map`, 
                JSON.stringify(result.sourceMap), 
                'utf8'
              );
              
              // Adiciona a referência ao sourcemap no arquivo CSS
              await fs.appendFile(
                outputPath,
                `\n/*# sourceMappingURL=${moduleName}.css.map */`,
                'utf8'
              );
            }
            
            console.log(`✓ Compiled module: ${moduleName}.css`);
          } catch (error) {
            console.error(`✗ Error compiling module ${moduleName}.scss:`, error);
          }
        }
        
        console.log('✓ All modules compiled to dist/module/');
      }
    },
    
    // Plugin para criar a versão minificada do main.css
    {
      name: 'create-minified-css',
      closeBundle: async () => {
        try {
          // Importa o CleanCSS para minificação adequada ou use o cssnano
          const { default: CleanCSS } = await import('clean-css');
          
          // Caminho para o CSS principal
          const mainCssPath = resolve(__dirname, 'dist/main.css');
          
          // Verifica se o arquivo main.css existe
          try {
            await fs.access(mainCssPath);
          } catch (err) {
            console.error('✗ main.css not found, cannot create minified version');
            return;
          }
          
          // Lê o conteúdo do CSS principal
          const cssContent = await fs.readFile(mainCssPath, 'utf-8');
          
          // Cria a versão minificada usando CleanCSS
          const minifier = new CleanCSS({ level: 2 });
          const minified = minifier.minify(cssContent);
          
          // Escreve a versão minificada
          await fs.writeFile(
            resolve(__dirname, 'dist/main.min.css'),
            minified.styles,
            'utf-8'
          );
          
          console.log('✓ Generated minified version: main.min.css');
        } catch (error) {
          console.error('✗ Error creating minified CSS:', error);
        }
      }
    },
    
    // Plugin para remover arquivos temporários/indesejados gerados pelo Vite
    {
      name: 'cleanup-temp-files',
      closeBundle: async () => {
        try {
          // Lista de possíveis arquivos temporários gerados pelo Vite que queremos remover
          const filesToRemove = [
            'dist/ignored-main.js',
            'dist/ignored-main2.js',
            'dist/main2.css',
            'dist/assets',
          ];
          
          // Remove cada arquivo ou diretório se existir
          for (const file of filesToRemove) {
            const path = resolve(__dirname, file);
            try {
              const stat = await fs.stat(path);
              if (stat.isDirectory()) {
                await fs.rm(path, { recursive: true, force: true });
              } else {
                await fs.unlink(path);
              }
              console.log(`✓ Removed temporary file: ${file}`);
            } catch (err) {
              // Arquivo não existe, podemos ignorar
            }
          }
        } catch (error) {
          console.error('✗ Error during cleanup:', error);
        }
      }
    },
    
    // Plugin para build de NPM (apenas main.min.css)
    {
      name: 'build-npm-package',
      apply: (config, { command }) => {
        // Executado apenas quando a flag --npm é passada
        return command === 'build' && process.argv.includes('--npm');
      },
      closeBundle: async () => {
        try {
          // Cria o diretório npm-package se não existir
          await fs.mkdir(resolve(__dirname, 'npm-package'), { recursive: true });
          
          // Copia apenas o main.min.css para o pacote npm
          await fs.copyFile(
            resolve(__dirname, 'dist/main.min.css'),
            resolve(__dirname, 'npm-package/main.min.css')
          );
          
          console.log('✓ Created npm package with main.min.css only');
        } catch (error) {
          console.error('✗ Error creating npm package:', error);
        }
      }
    }
  ],
});