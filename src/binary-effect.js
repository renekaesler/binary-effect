import {
  createBufferInfoFromArrays,
  drawBufferInfo,
  createProgramInfo,
  setBuffersAndAttributes,
  setUniforms,
  createTextures
} from "twgl.js";

import { loadImage } from "./utils/image";


const vertexShader = `
  precision lowp float;

  attribute vec2 position;
  varying   vec2 fragCoord;

  void main(void) {
    fragCoord   = (position * 0.5) + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;


const fragmentShader = `
  precision lowp float;

  uniform sampler2D characters;
  uniform sampler2D image;

  uniform float progress;
  uniform float smoothness;
  uniform vec2  characterSize;
  varying vec2  fragCoord;

  float PHI = 1.61803398874989484820459;  // golden ratio


  float random(vec2 xy, float seed){
    return clamp(
      fract(tan(distance(xy*PHI, xy)*seed) * distance(xy*PHI, xy)),
      0.0,
      1.0
    );
  }


  float randomBit(vec2 cellIdx) {
    return clamp(floor(random(cellIdx, 23.0) + 0.5), 0.0, 1.0);
  }


  float easeCell(vec2 idx) {
    return smoothstep(
      0.0,
      -smoothness,
      random(idx, 42.0) - (progress * (1.0 + smoothness))
    );
  }


  vec4 bitMask(vec2 cellIdx, vec2 gridCoord) {
    float bit = randomBit(cellIdx);

    vec2  cellCoord  = vec2(
      mod(gridCoord.x, 1.0),
      mod(gridCoord.y, 1.0)
    );

    vec2 charactersCoord = vec2(
      cellCoord.x * 0.5 + (0.5 * bit),
      cellCoord.y
    );

    return texture2D(characters, charactersCoord);
  }


  void main(void) {
    vec2 gridCoord  = (fragCoord - 1.5) * (1.0 / characterSize);
    vec2 cellIdx    = floor(gridCoord);

    vec4  img   = texture2D(image, fragCoord);
    float alpha = bitMask(cellIdx, gridCoord).r * easeCell(cellIdx);

    gl_FragColor = vec4(img.rgb, alpha);
  }
`;


class BinaryEffect extends HTMLCanvasElement {
  constructor() {
    super();

    this.gl = this.getContext('webgl');
  }


  connectedCallback() {
    this.run();
  }


  run() {
    cancelAnimationFrame(this.animationId);

    setTimeout(async () => {
      await this.#setup();

      this.startedAt = performance.now();
      this.animationId = requestAnimationFrame(this.#animationLoop);
    }, this.delay);
  }


  clear() {
    const { gl } = this;
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  }


  async #setup() {
    const { gl } = this;

    this.programInfo = createProgramInfo(gl, [vertexShader, fragmentShader]);
    this.bufferInfo = createBufferInfoFromArrays(gl, {
      position: {
        numComponents: 2,
        data: [
          1.0,  1.0,
         -1.0,  1.0,
          1.0, -1.0,
         -1.0, -1.0
       ]
      }
    });

    const [img, charactersImg] = await Promise.all([
      loadImage(this.imageSrc),
      loadImage(this.charactersSrc)
    ]);

    this.width = img.naturalWidth;
    this.height = img.naturalHeight;

    gl.useProgram(this.programInfo.program);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );

    const smoothness = this.smoothness ?? 0.2;
    const characterScaling = this.characterScaling ?? 1.0

    setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
    setUniforms(this.programInfo, {
      smoothness,
      characterSize: [
        (charactersImg.width * characterScaling * 0.5 ) / this.width,
        (charactersImg.height * characterScaling) / this.height
      ],
      ...createTextures(gl, {
        image: { src: img, flipY: 1 },
        characters: { src: charactersImg,  internalFormat: gl.LUMIANCE }
      })
    });
  }


  #animationLoop = (time) => {
    const { gl } = this;

    const elapsed = Math.max(0, time - this.startedAt);
    const progress = Math.min(elapsed / this.duration, 1);

    this.clear();   
    setUniforms(this.programInfo, { progress });
    drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLE_STRIP);

    if (progress < 1) {
      this.animationId = requestAnimationFrame(this.#animationLoop)
    }
  }
}

customElements.define('binary-effect', BinaryEffect, { extends: 'canvas' });
