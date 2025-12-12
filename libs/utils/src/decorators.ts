import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message:
          'Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*_)',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          if (value.length < 10) {
            return false;
          }

          if (!/[A-Z]/.test(value)) {
            return false;
          }

          if (!/[a-z]/.test(value)) {
            return false;
          }

          const allowedSpecialChars = [
            '!',
            '@',
            '#',
            '$',
            '%',
            '^',
            '&',
            '*',
            '_',
          ];
          const hasSpecialChar = allowedSpecialChars.some((char) =>
            value.includes(char),
          );
          if (!hasSpecialChar) {
            return false;
          }

          return true;
        },
        defaultMessage() {
          return 'Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*_)';
        },
      },
    });
  };
}
