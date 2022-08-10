import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class EditAccountInput extends PartialType(
  PickType(User, ['email', 'username', 'password']),
) {}

@ObjectType()
export class EditAccountOutput extends CommonOutput {}
