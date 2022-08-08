import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CommonOutput {
  @Field((type) => Boolean)
  success: boolean;

  @Field((type) => String, { nullable: true })
  error?: string;

  @Field((type) => Date, { defaultValue: Date.now() })
  queryDate: Date;
}
