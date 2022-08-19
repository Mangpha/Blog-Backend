import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CommonEntity } from 'src/common/entity/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity()
@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
export class Category extends CommonEntity {
  @Column({ unique: true })
  @Field((type) => String)
  @IsString()
  name: string;

  @OneToMany((type) => Post, (post) => post.category)
  @Field((type) => [Post], { nullable: true })
  posts: Post[];
}
