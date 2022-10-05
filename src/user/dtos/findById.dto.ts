import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class FindByIdOutput extends CommonOutput {
  @Field((type) => User, { nullable: true })
  user?: User;
}

@InputType()
export class FindByIdInput extends PickType(User, ['id']) {}
