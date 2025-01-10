struct LcgRandom {
    state: u32,
}

impl LcgRandom {
    fn new(seed: u32) -> Self {
        LcgRandom { state: seed }
    }

    fn next(&mut self) -> f64 {
        const A: u32 = 1664525;
        const C: u32 = 1013904223;

        // 使用位运算代替乘法和取模运算
        self.state = self.state.wrapping_mul(A).wrapping_add(C);
        self.state as f64 / 4294967296.0 // 2^32 = 4294967296
    }
}

fn calculate_pi(num_points: usize, seed: u32) -> f64 {
    let mut random = LcgRandom::new(seed);
    let mut inside_circle = 0;

    for _ in 0..num_points {
        let x = random.next() * 2.0 - 1.0; // x ∈ [-1, 1]
        let y = random.next() * 2.0 - 1.0; // y ∈ [-1, 1]

        if x * x + y * y <= 1.0 {
            inside_circle += 1;
        }
    }

    (inside_circle as f64 / num_points as f64) * 4.0
}

use std::time::Instant;

fn main() {
    let num_points = 1_000_000_000;
    let seed = 12345;
    let start = Instant::now();
    let pi = calculate_pi(num_points, seed);
    let duration = start.elapsed();
    println!("Estimated value of π: {}", pi);
    println!("Time taken: {:?}", duration);
}
