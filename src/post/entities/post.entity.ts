import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CommonEntity } from 'src/common/entity/common.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Category } from './category.entity';

@Entity()
@InputType('PostInputType', { isAbstract: true })
@ObjectType()
export class Post extends CommonEntity {
  @Column()
  @Field((type) => String)
  @IsString()
  @Length(1)
  title: string;

  @Column({ type: 'text' })
  @Field((type) => String)
  @IsString()
  content: string;

  @ManyToOne((type) => User, (user) => user.posts, { onDelete: 'SET NULL' })
  @Field((type) => User, { nullable: true })
  author?: User;

  @RelationId((post: Post) => post.author)
  authorId: number;

  @ManyToOne((type) => Category, (category) => category.posts, {
    onDelete: 'SET NULL',
  })
  @Field((type) => Category, { nullable: true })
  category?: Category;

  @RelationId((post: Post) => post.category)
  categoryId: number;
}
