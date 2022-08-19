import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Post } from '../../entities/post.entity';

@InputType()
export class FindPostByIdInput extends PickType(Post, ['id']) {}

@ObjectType()
export class FindPostByIdOutput extends CommonOutput {
  @Field((type) => Post, { nullable: true })
  post?: Post;
}
