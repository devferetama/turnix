import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsGreaterThan(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isGreaterThan',
      target: object.constructor,
      propertyName,
      constraints: [relatedPropertyName],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const relatedProperty = String(args.constraints[0]);
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedProperty
          ];

          if (
            value === undefined ||
            value === null ||
            relatedValue === undefined ||
            relatedValue === null
          ) {
            return true;
          }

          if (typeof value !== 'number' || typeof relatedValue !== 'number') {
            return true;
          }

          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const relatedProperty = String(args.constraints[0]);

          return `${args.property} must be greater than ${relatedProperty}`;
        },
      },
    });
  };
}
