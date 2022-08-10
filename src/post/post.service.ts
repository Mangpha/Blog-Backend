import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
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
      console.log(e);
      return { success: false, error: 'Could not create post' };
    }
  }
}
