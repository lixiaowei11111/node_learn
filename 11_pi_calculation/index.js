function lcgRandom(seed) {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  let state = seed;

  return () => {
    state = (a * state + c) % m;
    return state / m; // 归一化到 [0, 1)
  };
}

function calculatePi(numPoints, seed) {
  const random = lcgRandom(seed);
  let insideCircle = 0;

  for (let i = 0; i < numPoints; i++) {
    const x = random() * 2 - 1; // x ∈ [-1, 1]
    const y = random() * 2 - 1; // y ∈ [-1, 1]

    if (x * x + y * y <= 1) {
      insideCircle++;
    }
  }

  return (insideCircle / numPoints) * 4;
}

// 测试
const numPoints = 1_00_000_000;
const seed = 12345; // 固定随机数种子

const start = performance.now();
const pi = calculatePi(numPoints, seed);
const end = performance.now();
console.log(`Estimated value of π: ${pi};\nTime taken: ${(end - start) / 1000} seconds`);
