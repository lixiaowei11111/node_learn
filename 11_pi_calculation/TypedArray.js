function calculatePi(numPoints, batchSize = 10_000_000) {
  let insideCircle = 0;
  let processedPoints = 0;

  while (processedPoints < numPoints) {
    const pointsInBatch = Math.min(batchSize, numPoints - processedPoints);
    const randomNumbers = new Float32Array(pointsInBatch * 2);

    // 生成当前批次的随机数
    for (let i = 0; i < randomNumbers.length; i++) {
      randomNumbers[i] = Math.random() * 2 - 1; // 生成 [-1, 1] 范围内的随机数
    }

    // 计算当前批次
    for (let i = 0; i < pointsInBatch; i++) {
      const x = randomNumbers[i * 2];
      const y = randomNumbers[i * 2 + 1];
      const distanceSquared = x * x + y * y; // 计算距离平方

      if (distanceSquared <= 1) {
        insideCircle++;
      }
    }

    processedPoints += pointsInBatch;
  }

  return (insideCircle / numPoints) * 4;
}

// 测试
const numPoints = 1_000_000_000;
const start = performance.now();
const pi = calculatePi(numPoints);
const end = performance.now();
console.log(`Estimated value of π: ${pi}`);
console.log(`Time taken: ${(end - start) / 1000} seconds`);
