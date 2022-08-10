import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonEntity } from 'src/common/entity/common.entity';
import { Entity, OneToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity()
@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
export class Category extends CommonEntity {
  @Field((type) => String)
  name: string;

  @OneToMany((type) => Post, (post) => post.category)
  @Field((type) => [Post], { nullable: true })
  posts: Post[];
}
