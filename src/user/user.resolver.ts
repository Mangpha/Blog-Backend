import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  @Query((type) => String)
  hello(): string {
    return 'Hello World!';
  }
}
