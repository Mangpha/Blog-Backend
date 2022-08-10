import { CustomRepository } from 'src/typeorm/custom.decorator';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@CustomRepository(Post)
export class PostRepository extends Repository<Post> {}
