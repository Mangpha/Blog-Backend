import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Category } from 'src/post/entities/category.entity';

@InputType()
export class DeleteCategoryInput extends PickType(Category, ['id']) {}

@ObjectType()
export class DeleteCategoryOutput extends CommonOutput {}
