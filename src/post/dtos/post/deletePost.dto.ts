import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Post } from '../../entities/post.entity';

@InputType()
export class DeletePostInput extends PickType(Post, ['id']) {}

@ObjectType()
export class DeletePostOutput extends CommonOutput {}
