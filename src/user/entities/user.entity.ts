import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsString, Length } from 'class-validator';
import { CommonEntity } from 'src/common/entity/common.entity';
import { Column, Entity } from 'typeorm';

export enum UserRoles {
  Admin = 'Admin',
  User = 'User',
  Guest = 'Guest',
}

registerEnumType(UserRoles, { name: 'UserRoles' });

@Entity()
@InputType('UserInputType', { isAbstract: true })
@ObjectType()
export class User extends CommonEntity {
  @Column()
  @Field((type) => String)
  @IsString()
  @Length(6)
  username: string;

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  @Length(8)
  password: string;

  @Column({ type: 'enum', enum: UserRoles })
  @Field((type) => UserRoles)
  @IsEnum(UserRoles)
  role: UserRoles;

  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;
}
