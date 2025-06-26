import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { UploadService } from './upload.service';
import { ChunkUploadDto, ChunkUploadSchema } from './dto/chunk-upload.dto';
import { VerifyChunkDto, VerifyChunkSchema } from './dto/verify-chunk.dto';
import { MergeChunksDto, MergeChunksSchema } from './dto/merge-chunks.dto';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 验证文件是否已上传或部分上传
  @Post('verify')
  @UsePipes(new ZodValidationPipe<VerifyChunkDto>(VerifyChunkSchema))
  verifyUpload(@Body() verifyChunkDto: VerifyChunkDto) {
    return this.uploadService.verifyUpload(verifyChunkDto);
  }

  // 上传分片
  @Post('chunk')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const { fileHash } = req.body as ChunkUploadDto;
          const chunkDir = path.join(process.cwd(), 'uploads/chunks', fileHash);
          // 目录创建由service处理
          cb(null, chunkDir);
        },
        filename: (req, file, cb) => {
          const { chunkIndex } = req.body as ChunkUploadDto;
          cb(null, `${chunkIndex}`);
        },
      }),
    }),
  )
  uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(ChunkUploadSchema))
    chunkUploadDto: ChunkUploadDto,
  ) {
    console.log('[debug] file', file);
    return this.uploadService.saveChunk(file, chunkUploadDto);
  }

  // 合并分片
  @Post('merge')
  @UsePipes(new ZodValidationPipe(MergeChunksSchema))
  mergeChunks(@Body() mergeChunksDto: MergeChunksDto) {
    return this.uploadService.mergeChunks(mergeChunksDto);
  }

  // 下载已上传的文件
  @Get('download/:fileHash')
  downloadFile(
    @Param('fileHash') fileHash: string,
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    return this.uploadService.downloadFile(fileHash, filename, res);
  }
}
