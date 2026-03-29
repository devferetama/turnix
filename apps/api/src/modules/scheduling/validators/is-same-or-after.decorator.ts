import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

function toComparableDate(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.getTime();
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
}

export function IsSameOrAfter(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isSameOrAfter',
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

          const currentTime = toComparableDate(value);
          const relatedTime = toComparableDate(relatedValue);

          if (currentTime === undefined || relatedTime === undefined) {
            return true;
          }

          return currentTime >= relatedTime;
        },
        defaultMessage(args: ValidationArguments) {
          const relatedProperty = String(args.constraints[0]);

          return `${args.property} must not be before ${relatedProperty}`;
        },
      },
    });
  };
}
