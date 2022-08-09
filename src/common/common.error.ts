import { CommonOutput } from './dto/common.dto';

export const InternalServerErrorOutput: CommonOutput = {
  success: false,
  error: 'Internal server error occurred.',
};
