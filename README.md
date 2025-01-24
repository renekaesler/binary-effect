# Binary Effect

Transform your images into stunning binary art with ease using a customized canvas 
element. Whether you're looking to add a unique touch to your website or create 
captivating visuals for your projects, this customized canvas converts images into 
striking binary representations.

**Demo**: [Binary Effect](https://renekaesler.github.io/binary-effect/)


## Usage

```html
<canvas is="binary-effect">
  <script>
    Object.assign(document.currentScript.parentElement, {
      imageSrc: 'logo.png',
      charactersSrc: 'characters.png',
      smoothness: 0.2,
      characterScaling: 0.35,
      duration: 4000,
      delay: 1000,
    });
  </script>
</canvas>

<script type="module">
  import { createBinaryEffect } from 'binary-effect';

  const canvas = document.querySelector('canvas');
  const effect = await createBinaryEffect(canvas, {
    imageSrc: 'vite.svg',
    charactersSrc: 'characters.png',
    smoothness: 0.2,
    characterScaling: 0.5,
    duration: 4000,
  });

  effect.run();
</script>
```
