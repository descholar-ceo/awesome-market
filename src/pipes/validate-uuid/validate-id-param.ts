import { ArgumentMetadata } from '@nestjs/common';
import { ValidateUuidPipe } from './validate-uuid';

export class ValidateIdFromParam extends ValidateUuidPipe {
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }
    return super.transform(value, metadata);
  }
}
