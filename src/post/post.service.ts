import { Injectable } from '@nestjs/common';
import { InternalServerErrorOutput } from 'src/common/common.error';
import { User } from 'src/user/entities/user.entity';
import { Raw } from 'typeorm';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import { DeletePostInput, DeletePostOutput } from './dtos/deletePost.dto';
import { EditPostInput, EditPostOutput } from './dtos/editPost.dto';
import { FindAllPostsInput, FindAllPostsOutput } from './dtos/findAllPosts.dto';
import { FindPostByIdInput, FindPostByIdOutput } from './dtos/findPostById.dto';
import {
  FindPostByTitleInput,
  FindPostByTitleOutput,
} from './dtos/findPostByTitle.dto';
import { CategoryRepository } from './repositories/category.repository';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(
    author: User,
    { title, content, category }: CreatePostInput,
  ): Promise<CreatePostOutput> {
    try {
      await this.postRepository.save(
        this.postRepository.create({
          title,
          content,
          category,
          author,
        }),
      );
      return { success: true };
    } catch (e) {
      return InternalServerErrorOutput;
    }
  }

  async findAllPosts({ page }: FindAllPostsInput): Promise<FindAllPostsOutput> {
    try {
      return await this.postRepository.findCount(page);
    } catch {
      return InternalServerErrorOutput;
    }
  }

  async findPostById({ id }: FindPostByIdInput): Promise<FindPostByIdOutput> {
    try {
      const post = await this.postRepository.findOne({
        where: {
          id,
        },
        relations: ['author'],
      });
      if (!post) return { success: false, error: `Post ${id} not found` };
      return { success: true, post };
    } catch {
      return InternalServerErrorOutput;
    }
  }

  async findPostByTitle({
    query,
    page,
  }: FindPostByTitleInput): Promise<FindPostByTitleOutput> {
    try {
      const findPosts = await this.postRepository.findCount(page, {
        title: Raw((search) => `${search} ILIKE '%${query}%'`),
      });
      if (findPosts.posts.length === 0)
        return { success: false, error: 'Posts are not found' };
      return { success: true, ...findPosts };
    } catch (e) {
      console.log(e);
      return InternalServerErrorOutput;
    }
  }

  async editPost(
    userId: number,
    editPostInput: EditPostInput,
  ): Promise<EditPostOutput> {
    try {
      const post = await this.postRepository.findOne({
        where: {
          id: editPostInput.postId,
        },
        loadRelationIds: true,
      });
      if (post.authorId !== userId)
        return { success: false, error: 'Permission Denied' };
      if (!post)
        return {
          success: false,
          error: `Post ${editPostInput.postId} Not found`,
        };
      await this.postRepository.save({
        id: editPostInput.postId,
        ...editPostInput,
      });
      return { success: true };
    } catch {
      return InternalServerErrorOutput;
    }
  }

  async deletePost({ id }: DeletePostInput): Promise<DeletePostOutput> {
    try {
      await this.postRepository.delete({ id });
      return { success: true };
    } catch {
      return InternalServerErrorOutput;
    }
  }
}
