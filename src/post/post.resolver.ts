import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { UserData } from 'src/auth/userData.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreatePostInput, CreatePostOutput } from './dtos/createPost.dto';
import { FindAllPostsInput, FindAllPostsOutput } from './dtos/findAllPosts.dto';
import { FindPostByIdInput, FindPostByIdOutput } from './dtos/findPostById.dto';
import { PostService } from './post.service';

@Resolver()
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Roles('User', 'Admin')
  @Mutation((type) => CreatePostOutput)
  createPost(
    @UserData() author: User,
    @Args('input') createPostInput: CreatePostInput,
  ): Promise<CreatePostOutput> {
    return this.postService.createPost(author, createPostInput);
  }

  @Query((type) => FindAllPostsOutput)
  findAllPosts(
    @Args('input') findAllPostsInput: FindAllPostsInput,
  ): Promise<FindAllPostsOutput> {
    return this.postService.findAllPosts(findAllPostsInput);
  }

  @Query((type) => FindPostByIdOutput)
  findPostById(
    @Args('input') findPostByIdInput: FindPostByIdInput,
  ): Promise<FindPostByIdOutput> {
    return this.postService.findPostById(findPostByIdInput);
  }
}
