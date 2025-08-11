mod utils;

use blake3;
use wasm_bindgen::prelude::*;

// 当 panic 发生时打印错误信息
#[wasm_bindgen]
extern "C" {
    // 使用 `js_namespace` 属性让这个 `fn` 调用 JavaScript 的 `console.log` 函数
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct HashCalculator {
    hasher: blake3::Hasher,
}

#[wasm_bindgen]
impl HashCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // 设置 panic hook
        utils::set_panic_hook();

        HashCalculator {
            hasher: blake3::Hasher::new(),
        }
    }

    // 更新整体文件哈希
    #[wasm_bindgen]
    pub fn update(&mut self, data: &[u8]) {
        self.hasher.update(data);
    }

    // 完成计算并返回整体文件哈希值
    #[wasm_bindgen]
    pub fn finalize(&self) -> String {
        let hash = self.hasher.clone().finalize();
        hash.to_hex().to_string()
    }

    // 计算单个块的哈希
    #[wasm_bindgen]
    pub fn calculate_chunk_hash(&self, data: &[u8]) -> String {
        let hash = blake3::hash(data);
        hash.to_hex().to_string()
    }
}

// 直接计算整个数据的哈希（便捷函数）
#[wasm_bindgen]
pub fn calculate_hash(data: &[u8]) -> String {
    utils::set_panic_hook();

    let hash = blake3::hash(data);
    hash.to_hex().to_string()
}
