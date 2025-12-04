<div align="center">
	
![Logo Helix CSS](./public/doc/cover.png)

</div>

<p align="center">
  A developer-friendly CSS framework for modern web development
</p>

<br/>
<br/>

## About

Helix CSS is an intuitive CSS framework designed to streamline web development with simple, easy-to-use utilities for building modern web projects. With a focus on developer experience, responsive design, and simplicity, Helix CSS offers a comprehensive set of classes that make creating adaptive and visually appealing layouts effortless and enjoyable.

### Key Features

- **Developer-friendly:** Simple and intuitive class naming convention that accelerates development
- **Modular:** Choose only the modules you need for your
  project, or use the complete framework for a comprehensive
  solution.
- **Easy to use:** Straightforward utilities that require minimal learning curve
- **Responsive:** Built-in responsive grid system for
  creating flexible and adaptive layouts across various
  devices and screen sizes.
- **Customizable:** Easily customize and extend Helix CSS to
  suit your project's specific requirements.
- **Efficient:** Optimized for performance while maintaining comprehensive functionality
  

<br/>
<br/>

## Get started

You can also install the Helix CSS library via NPM:

```bash
npm i helix-css
```

Or you can embed the CDN code in your file:

**HTML**

```html
<!-- Compressed -->
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/main.min.css" />

<!-- Expanded -->
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/main.css" />
```

<br/>

**CSS**

```css
/* Compressed */
@import url('https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/main.min.css');

/* Expanded */
@import url('https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/main.css');
```

<br/>

**Modules**

You can also install the separate modules in your project

```bash
// Compressed
https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/module/layout.css

// Expanded
https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/module/layout.min.css
```

<br/>
<br/>

## Quick Start
Here’s a basic example of using Helix CSS:

**HTML Example**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Helix CSS Example</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Helixify/helix-css@latest/dist/main.min.css" />
</head>
<body>
  <section class="p-block-16">
    <div class="ds-flex-center">
      <h1 class="text-center">Hello World</h1>
      <p class="text-muted">Welcome to Helix CSS!</p>
    </div>
  </section>
</body>
</html>
```

<br/>

**React Example**
```javascript
import 'helix-css';

export const App = () => {
  return (
    <section className="p-block-16">
      <div className="ds-flex-center">
        <h1 className="text-center">Hello World</h1>
        <p className="text-muted">Welcome to Helix CSS!</p>
      </div>
    </section>
  );
};
```

<br/>

**Vue Example**
```javascript
<template>
  <section class="p-block-16">
    <div class="ds-flex-center">
      <h1 class="text-center">Hello World</h1>
      <p class="text-muted">Welcome to Helix CSS!</p>
    </div>
  </section>
</template>

<script>
import 'helix-css';

export default {
  name: 'App'
};
</script>
```

<br/>
<br/>

## License

Helix CSS is released under the [MIT License](/license.md).
You are free to use and modify it for your projects.

<br/>
<br/>

<div align="center">
  Made with ❤️ by the <a href="https://www.helixify.dev/" target="_blank">Helixify</a>.
</div>
