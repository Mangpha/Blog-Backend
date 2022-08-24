import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class ChangeRoleInput extends PickType(User, ['role']) {}

@ObjectType()
export class ChangeRoleOutput extends CommonOutput {}
