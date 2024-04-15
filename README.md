# Binary Effect

Transform your images into stunning binary art with ease using a customized canvas 
element. Whether you're looking to add a unique touch to your website or create 
captivating visuals for your projects, this customized canvas converts images into 
striking binary representations.

**Demo**: renekaesler.github.io/binary-effect


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
```
