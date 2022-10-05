import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import { InternalServerErrorOutput } from 'src/common/common.error';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    try {
      const object = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Bucket: process.env.BUCKET,
          Body: file.buffer,
          Key: object,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${process.env.BUCKET}.s3.amazonaws.com/${object}`;
      return { url };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
