import { UUID_REGEX } from '@/common/utils/regex.utils';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ValidateUuidPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    if (!value?.match(UUID_REGEX)) {
      throw new BadRequestException('Invalid UUID');
    }
    return value;
  }
}
