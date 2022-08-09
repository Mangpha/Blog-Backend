import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class FindByIdOutput extends CommonOutput {
  @Field((type) => User, { nullable: true })
  user?: User;
}
