import { ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';

@ObjectType()
export class DeleteAccountOutput extends CommonOutput {}
