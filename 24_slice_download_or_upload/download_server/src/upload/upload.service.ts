import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ChunkUploadDto } from './dto/chunk-upload.dto';
import { VerifyChunkDto } from './dto/verify-chunk.dto';
import { MergeChunksDto } from './dto/merge-chunks.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Response } from 'express';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly chunksDir = path.join(this.uploadDir, 'chunks');
  private readonly filesDir = path.join(this.uploadDir, 'files');

  constructor() {
    this.initFolders().catch((error) => console.log('[debug] ', error));
  }

  // 初始化上传所需的文件夹
  private async initFolders() {
    await fs.ensureDir(this.chunksDir);
    await fs.ensureDir(this.filesDir);
  }

  // 验证文件上传状态
  async verifyUpload(verifyChunkDto: VerifyChunkDto) {
    const { fileHash, filename, chunkTotal } = verifyChunkDto;
    const filePath = path.join(this.filesDir, `${fileHash}-${filename}`);

    // 检查文件是否已经存在（已完全上传）
    const fileExists = await fs.pathExists(filePath);
    if (fileExists) {
      return {
        code: 0,
        data: {
          status: 'success',
          uploadedChunks: [],
          url: `/upload/download/${fileHash}?filename=${encodeURIComponent(filename)}`,
        },
      };
    }

    // 检查是否有部分分片已上传
    const chunkDir = path.join(this.chunksDir, fileHash);
    const chunkDirExists = await fs.pathExists(chunkDir);

    if (!chunkDirExists) {
      // 没有任何分片，需要从头开始上传
      return {
        code: 1,
        data: {
          status: 'pending',
          uploadedChunks: [],
        },
      };
    }

    // 获取已上传的分片列表
    const files = await fs.readdir(chunkDir);
    const uploadedChunks = files.map((filename) => parseInt(filename, 10));

    // 检查是否所有分片都已经上传
    if (uploadedChunks.length === chunkTotal) {
      return {
        code: 2,
        data: {
          status: 'ready',
          uploadedChunks,
        },
      };
    }

    // 部分分片已上传，返回已上传的分片信息
    return {
      code: 3,
      data: {
        status: 'partial',
        uploadedChunks,
      },
    };
  }

  // 保存分片
  async saveChunk(file: Express.Multer.File, chunkUploadDto: ChunkUploadDto) {
    const { fileHash, chunkIndex, chunkTotal } = chunkUploadDto;

    // 确保分片目录存在
    const chunkDir = path.join(this.chunksDir, fileHash);
    await fs.ensureDir(chunkDir);

    // 检查分片是否已经上传（断点续传）
    const chunkPath = path.join(chunkDir, `${chunkIndex}`);
    const exists = await fs.pathExists(chunkPath);

    if (!exists && !file) {
      throw new BadRequestException('Chunk file is required');
    }

    // 如果分片已存在，则跳过
    if (exists) {
      return {
        code: 0,
        message: `Chunk ${chunkIndex} already exists`,
        data: {
          chunkIndex,
          uploadedCount: (await fs.readdir(chunkDir)).length,
          chunkTotal,
        },
      };
    }

    // 确保文件已正确上传
    if (!file) {
      throw new BadRequestException('Chunk file upload failed');
    }

    // 返回成功响应
    return {
      code: 0,
      message: `Chunk ${chunkIndex} uploaded successfully`,
      data: {
        chunkIndex,
        uploadedCount: (await fs.readdir(chunkDir)).length,
        chunkTotal,
      },
    };
  }

  // 合并分片
  async mergeChunks(mergeChunksDto: MergeChunksDto) {
    const { fileHash, filename } = mergeChunksDto;
    const chunkDir = path.join(this.chunksDir, fileHash);
    const filePath = path.join(this.filesDir, `${fileHash}-${filename}`);

    // 检查是否已经合并
    const fileExists = await fs.pathExists(filePath);
    if (fileExists) {
      return {
        code: 0,
        message: 'File already merged',
        data: {
          url: `/upload/download/${fileHash}?filename=${encodeURIComponent(filename)}`,
        },
      };
    }

    // 检查分片目录是否存在
    const chunkDirExists = await fs.pathExists(chunkDir);
    if (!chunkDirExists) {
      throw new NotFoundException('No chunks found for this file');
    }

    // 获取分片列表并排序
    const chunkFilenames = await fs.readdir(chunkDir);
    const sortedChunkFilenames = chunkFilenames.sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10),
    );

    // 创建可写流，用于合并文件
    const writeStream = fs.createWriteStream(filePath);

    // 依次将每个分片写入目标文件
    for (const chunkFilename of sortedChunkFilenames) {
      const chunkPath = path.join(chunkDir, chunkFilename);
      const chunkContent = await fs.readFile(chunkPath);
      writeStream.write(chunkContent);
    }

    // 完成写入
    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        // 清理分片目录
        fs.remove(chunkDir)
          .then(() => {
            resolve({
              code: 0,
              message: 'File merged successfully',
              data: {
                url: `/upload/download/${fileHash}?filename=${encodeURIComponent(filename)}`,
              },
            });
          })
          .catch((error: unknown) => {
            console.log('[debug] ', error);
            reject(new BadRequestException('Failed to clean up chunks'));
          });
      });

      writeStream.on('error', (error) => {
        reject(
          new BadRequestException(`Failed to merge chunks: ${error.message}`),
        );
      });
    });
  }

  // 下载已上传的文件
  async downloadFile(fileHash: string, filename: string, res: Response) {
    const filePath = path.join(this.filesDir, `${fileHash}-${filename}`);

    // 检查文件是否存在
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      throw new NotFoundException('File not found');
    }

    // 设置响应头并发送文件
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}`,
    );
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
