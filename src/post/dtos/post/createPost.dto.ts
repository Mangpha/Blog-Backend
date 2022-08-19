import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Category } from '../../entities/category.entity';
import { Post } from '../../entities/post.entity';

@InputType()
export class CreatePostInput extends PickType(Post, ['title', 'content']) {
  @Field((type) => Category, { nullable: true })
  category?: Category;
}

@ObjectType()
export class CreatePostOutput extends CommonOutput {}
