import { CustomRepository } from 'src/typeorm/custom.decorator';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@CustomRepository(User)
export class UserRepository extends Repository<User> {}
