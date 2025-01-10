// 计算阶乘的函数
function factorial(n) {
  if (n === 0 || n === 1) return BigInt(1);
  let result = BigInt(1);
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i);
  }
  return result;
}

// 计算 π 的拉马努金公式
function calculatePiRamanujan(iterations) {
  const sqrt10005 = Math.sqrt(10005).toString(); // 计算 √10005 并转换为字符串
  const C = BigInt(426880) * BigInt(Math.floor(parseFloat(sqrt10005) * 1e14)); // 提高精度
  let sum = BigInt(0);

  for (let k = 0; k < iterations; k++) {
    const numerator = factorial(4 * k) * (BigInt(1103) + BigInt(26390) * BigInt(k));
    const denominator = factorial(k) ** BigInt(4) * BigInt(396) ** BigInt(4 * k);
    sum += numerator / denominator;
  }

  const pi = (C / sum).toString();
  // 将结果格式化为 π 的近似值
  return pi[0] + '.' + pi.slice(1);
}

// 测试
const iterations = 1_000_000; // 迭代次数
const start = performance.now();
const pi = calculatePiRamanujan(iterations);
const end = performance.now();
console.log(`Estimated value of π: ${pi}\n taken time: ${(end - start) / 1000} second`);
