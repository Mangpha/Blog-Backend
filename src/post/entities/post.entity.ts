import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CommonEntity } from 'src/common/entity/common.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Category } from './category.entity';

@Entity()
@InputType('PostInputType', { isAbstract: true })
@ObjectType()
export class Post extends CommonEntity {
  @Column()
  @Field((type) => String)
  @IsString()
  title: string;

  @Column()
  @Field((type) => String)
  @IsString()
  content: string;

  @ManyToOne((type) => User, (user) => user.posts, { onDelete: 'SET NULL' })
  @Field((type) => User, { nullable: true })
  author: User;

  @RelationId((post: Post) => post.author)
  authorId: number;

  @ManyToOne((type) => Category, (category) => category.posts, {
    onDelete: 'SET NULL',
  })
  @Field((type) => Category, { nullable: true })
  category: Category;
}
