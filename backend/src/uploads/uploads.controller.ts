import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename, join } from 'path';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/jwt.strategy';
import { UserRole } from '../entities/user.entity';
import * as fs from 'fs';

const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Controller('uploads')
export class UploadsController {
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, callback) => {
          const cleanOriginalName = basename(file.originalname).replace(/[^a-zA-Z0-9_-]/g, '');
          const fileExt = extname(file.originalname).toLowerCase();
          const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
          if (!allowedExts.includes(fileExt)) {
            return callback(new BadRequestException('Extensión de archivo no permitida'), '');
          }
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${cleanOriginalName}-${uniqueSuffix}${fileExt}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se proporcionó ningún archivo');
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    };
  }

  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    const filePath = join(uploadsDir, safeName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Archivo no encontrado');
    }
    return res.sendFile(filePath);
  }
}
