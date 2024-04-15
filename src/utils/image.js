export const loadImage = async src => new Promise((resolve, reject) => {
  const image = new Image();
  image.src = src;
  image.onload = () => resolve(image);
  image.onerror = () => reject(`Unable to load Image (src="${src}")`);
});