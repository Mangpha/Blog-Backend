import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'username',
  'email',
  'password',
]) {}

@ObjectType()
export class CreateAccountOutput extends CommonOutput {}
