import { z } from 'zod';

// 首先定义类型接口

// zod schema，使用类型注解
export const ChunkUploadSchema = z.object({
  fileHash: z.string().min(1, '文件哈希不能为空'), // 文件的唯一标识（通常是MD5值）
  filename: z.string().min(1, '文件名不能为空'), // 原始文件名
  chunkIndex: z.number().int().min(0, '分片索引必须为非负整数'), // 当前分片索引
  chunkTotal: z.number().int().positive('分片总数必须为正整数'), // 分片总数
  chunkSize: z.number().int().positive('分片大小必须为正整数'), // 分片大小（字节）
  fileSize: z.number().int().positive('文件大小必须为正整数'), // 文件总大小（字节）
  fileType: z.string().optional(), // 文件类型，可选
});
// 导出类型
export type ChunkUploadDto = z.infer<typeof ChunkUploadSchema>;
