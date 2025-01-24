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

    gl_FragColor = vec4(img.rgb, img.a * alpha);
  }
`;

export async function createBinaryEffect(canvas, opts= {}) {
  let animationId;
  let startedAt = performance.now();
  let { duration = 4000, smoothness = 0.2, characterScaling = 1.0 } = opts;

  const gl = canvas.getContext('webgl');

  const [img, charactersImg] = await Promise.all([
    loadImage(opts.imageSrc),
    loadImage(opts.charactersSrc)
  ]);

  const programInfo = createProgramInfo(gl, [vertexShader, fragmentShader]);
  const bufferInfo = createBufferInfoFromArrays(gl, {
    position: {
      numComponents: 2,
      data: [
        1.0,  1.0,
       -1.0,  1.0,
        1.0, -1.0,
       -1.0, -1.0,
     ]
    }
  });

  function clear() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  }

  function animate(time) {
    const elapsed = Math.max(0, time - startedAt);
    const progress = Math.min(elapsed / duration, 1);

    clear();
    setUniforms(programInfo, { progress });

    drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate)
    }
  }

  function run() {
    canvas.width = img.width;
    canvas.height = img.height;

    gl.viewport(0, 0, img.width, img.height);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );

    gl.useProgram(programInfo.program);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    setUniforms(programInfo, {
      smoothness,
      characterSize: [
        (charactersImg.width * characterScaling * 0.5 ) / img.width,
        (charactersImg.height * characterScaling) / img.height
      ],
      ...createTextures(gl, {
        image: { src: img, flipY: 1 },
        characters: { src: charactersImg,  internalFormat: gl.LUMIANCE }
      })
    });

    cancelAnimationFrame(animationId);
    startedAt = performance.now();
    animationId = requestAnimationFrame(animate);
  }

  return {
    clear,
    run,

    get duration() {
      return duration;
    },

    set duration(value) {
      duration = value;
    },

    get smoothness() {
      return smoothness;
    },

    set smoothness(value) {
      smoothness = value;
    },

    get characterScaling() {
      return characterScaling;
    },

    set characterScaling(value) {
      characterScaling = value;
    },
  };
}
