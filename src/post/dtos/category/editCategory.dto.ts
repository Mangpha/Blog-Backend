import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Category } from 'src/post/entities/category.entity';

@InputType()
export class EditCategoryInput extends PickType(Category, ['id', 'name']) {}

@ObjectType()
export class EditCategoryOutput extends CommonOutput {}
