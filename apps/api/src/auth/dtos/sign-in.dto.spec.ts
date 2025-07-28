import { validate } from 'class-validator';

import { SignInDto } from './sign-in.dto';

describe('SignInDto Validation', () => {
  it('should pass validation with valid data', async () => {
    // Arrange
    const dto = new SignInDto();
    dto.email = 'test@example.com';
    dto.password = 'StrongPass1@';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  describe('email validation', () => {
    it('should fail validation with invalid email format', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.email = 'invalid-email';
      dto.password = 'StrongPass1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation with missing email', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.password = 'StrongPass1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('password validation', () => {
    it('should fail validation with password less than 10 characters', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.email = 'test@example.com';
      dto.password = 'Short1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isStrongPassword');
    });

    it('should fail validation with password without uppercase letter', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.email = 'test@example.com';
      dto.password = 'weakpassword1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isStrongPassword');
    });

    it('should fail validation with password without lowercase letter', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.email = 'test@example.com';
      dto.password = 'WEAKPASSWORD1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isStrongPassword');
    });

    it('should fail validation with password without special character', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.email = 'test@example.com';
      dto.password = 'WeakPassword1';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isStrongPassword');
    });

    it('should fail validation with missing password', async () => {
      // Arrange
      const dto = new SignInDto();
      dto.email = 'test@example.com';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });
  });
});
