import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const [regex] = args.constraints as RegExp[];
    return typeof password === 'string' && regex.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    const [regex] = args.constraints as RegExp[];
    return `Password is too weak. It must match the following pattern: ${regex.toString()}`;
  }
}

export const IsStrongPassword = (
  regex: RegExp,
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [regex],
      validator: IsStrongPasswordConstraint,
    });
  };
};
