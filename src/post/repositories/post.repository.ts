import { InternalServerErrorOutput } from 'src/common/common.error';
import { CustomRepository } from 'src/typeorm/custom.decorator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FindAllPostsOutput } from '../dtos/post/findAllPosts.dto';
import { Post } from '../entities/post.entity';

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {
  /**
   * The default page value is 1 and 10 values are taken. (order by ID : DESC)
   */
  async findCount(
    page: number,
    where?: FindOptionsWhere<Post>,
  ): Promise<FindAllPostsOutput> {
    try {
      const [posts, totalResults] = await this.findAndCount({
        skip: (page - 1) * 10,
        take: 10,
        order: { id: 'DESC' },
        relations: ['author'],
        where,
      });
      return {
        success: true,
        posts,
        totalPages: Math.ceil(totalResults / 10),
        totalResults,
      };
    } catch {
      return InternalServerErrorOutput;
    }
  }
}
