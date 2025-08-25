# 文件传输内存优化方案

## 问题分析

当前的 WebRTC 文件传输实现将所有接收到的文件块都存储在内存中的 `chunks: ArrayBuffer[]` 数组里，这导致以下问题：

1. **内存占用过高**: 大文件会占用大量内存，可能导致页面崩溃
2. **垃圾回收压力**: 大量 ArrayBuffer 对象给 GC 造成压力
3. **用户体验差**: 在低内存设备上可能出现卡顿

## 优化方案

### 方案1: IndexedDB 存储 (已实现)

**原理**: 将文件块存储到浏览器的 IndexedDB 中，而不是内存中。

**优势**:
- ✅ 大幅减少内存占用
- ✅ 持久化存储，刷新页面后数据不丢失
- ✅ 支持大文件传输（GB级别）
- ✅ 自动垃圾回收管理

**实现**:
```typescript
// 基础存储服务
const fileStorage = FileStorageService.getInstance();
await fileStorage.storeChunk(transferId, chunkIndex, data);
const blob = await fileStorage.assembleFile(transferId, totalChunks, fileType);
```

**效果**: 内存占用从文件大小降至几乎为0（仅保留少量缓冲区）

### 方案2: 高级优化存储 (推荐)

**新增功能**:
- 🔥 **压缩存储**: 使用 Compression Streams API 压缩文件块
- 🔥 **智能缓存**: 10MB 内存缓存提升访问速度
- 🔥 **流式处理**: 支持大文件的流式组装
- 🔥 **自动清理**: 自动清理过期数据

**压缩效果**:
- 文本文件: 压缩率 60-80%
- 图像文件: 压缩率 5-15%
- 视频文件: 压缩率 2-5%

**实现**:
```typescript
// 高级存储服务
const advancedStorage = AdvancedFileStorageService.getInstance();
await advancedStorage.storeChunk(transferId, chunkIndex, data); // 自动压缩
const blob = await advancedStorage.assembleFileStream(
  transferId, 
  totalChunks, 
  fileType,
  (progress) => console.log(`组装进度: ${progress}%`)
);
```

### 方案3: 混合策略

根据文件大小和类型选择不同的存储策略：

```typescript
const getOptimalStrategy = (fileSize: number, fileType: string) => {
  if (fileSize < 1024 * 1024) { // 1MB以下
    return 'memory'; // 直接内存存储，速度最快
  } else if (fileSize < 100 * 1024 * 1024) { // 100MB以下
    return 'indexeddb'; // IndexedDB存储
  } else {
    return 'advanced'; // 高级存储（压缩+缓存）
  }
};
```

## 性能对比

| 方案 | 内存占用 | 存储大小 | 访问速度 | 复杂度 |
|------|----------|----------|----------|--------|
| 原始方案 | 100% | N/A | 最快 | 低 |
| IndexedDB | ~5% | 100% | 中等 | 中 |
| 高级存储 | ~5% | 30-70% | 快 | 高 |
| 混合策略 | 动态 | 动态 | 最优 | 高 |

## 实施建议

### 立即实施 (方案1)
```bash
# 已实现的文件
client/src/services/fileStorageService.ts
client/src/hooks/useWebRTC.ts (已更新)
client/src/types/webRTC.ts (已更新)
```

### 渐进优化 (方案2)
```bash
# 新增文件
client/src/services/advancedFileStorageService.ts
client/src/components/shared/StorageManager.tsx
```

### 配置选项
```typescript
interface FileTransferConfig {
  // 存储策略
  storageStrategy: 'memory' | 'indexeddb' | 'advanced' | 'auto';
  
  // 缓存配置
  cacheSize: number; // 默认 10MB
  
  // 压缩配置
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate';
    level?: number;
  };
  
  // 自动清理
  autoCleanup: {
    enabled: boolean;
    maxAge: number; // 天数
    maxSize: number; // 字节
  };
}
```

## 监控和管理

使用 StorageManager 组件监控存储使用情况：

- 📊 实时存储使用量
- 📈 压缩率统计
- 🗑️ 一键清理功能
- ⚠️ 存储预警提示

## 最佳实践

1. **文件大小阈值**: 小文件(<1MB)继续使用内存，大文件使用 IndexedDB
2. **定期清理**: 设置7天自动清理策略
3. **压缩选择**: 对文本和代码文件启用压缩
4. **进度反馈**: 大文件组装时显示进度条
5. **错误处理**: 完善的存储错误恢复机制

## 用户体验改进

- ⚡ **更快的传输**: 减少内存压力，提升整体性能
- 💾 **持久化**: 刷新页面后可继续下载
- 📱 **移动端友好**: 在低内存设备上表现更好
- 🔒 **数据安全**: 本地存储，不依赖服务器

## 兼容性

- ✅ Chrome 67+
- ✅ Firefox 65+
- ✅ Safari 13+
- ✅ Edge 79+
- ❌ IE (不支持 IndexedDB 高级特性)