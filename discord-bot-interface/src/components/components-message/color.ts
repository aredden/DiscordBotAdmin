function extractRGB(i: number) {
  return {
    r: (i >> 16) & 0xFF,
    g: (i >> 8) & 0xFF,
    b: i & 0xFF,
  };
}

function combineRGB(r: number, g: number, b: number) {
  return (r << 16) | (g << 8) | b;
}

export { extractRGB, combineRGB };