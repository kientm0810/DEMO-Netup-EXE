function isFinderCell(x: number, y: number, size: number): boolean {
  const topLeft = x < 7 && y < 7;
  const topRight = x >= size - 7 && y < 7;
  const bottomLeft = x < 7 && y >= size - 7;
  if (!(topLeft || topRight || bottomLeft)) {
    return false;
  }

  const localX = x < 7 ? x : x - (size - 7);
  const localY = y < 7 ? y : y - (size - 7);
  const onOuter = localX === 0 || localX === 6 || localY === 0 || localY === 6;
  const onInner = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
  return onOuter || onInner;
}

export function buildMockQrMatrix(seed: string, size = 25): boolean[] {
  const bits = Array.from(seed)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");

  return Array.from({ length: size * size }, (_, index) => {
    const x = index % size;
    const y = Math.floor(index / size);

    if (isFinderCell(x, y, size)) {
      return true;
    }

    const bitIndex = (x * 7 + y * 11 + index) % bits.length;
    return bits[bitIndex] === "1";
  });
}
