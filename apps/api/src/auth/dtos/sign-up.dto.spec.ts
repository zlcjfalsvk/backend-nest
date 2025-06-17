import { validate } from 'class-validator';
import { SignUpDto } from './sign-up.dto';

describe('SignUpDto Validation', () => {
  it('should pass validation with valid data', async () => {
    // Arrange
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.nickName = 'testuser';
    dto.password = 'StrongPass1@';
    dto.introduction = 'Hello, I am a test user';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid data without optional introduction', async () => {
    // Arrange
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.nickName = 'testuser';
    dto.password = 'StrongPass1@';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  describe('email validation', () => {
    it('should fail validation with invalid email format', async () => {
      // Arrange
      const dto = new SignUpDto();
      dto.email = 'invalid-email';
      dto.nickName = 'testuser';
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
      const dto = new SignUpDto();
      dto.nickName = 'testuser';
      dto.password = 'StrongPass1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('nickName validation', () => {
    it('should fail validation with nickName longer than 20 characters', async () => {
      // Arrange
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'a'.repeat(21); // 21 characters
      dto.password = 'StrongPass1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nickName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation with non-string nickName', async () => {
      // Arrange
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      // Using Object.defineProperty to bypass TypeScript type checking
      Object.defineProperty(dto, 'nickName', { value: 123 });
      dto.password = 'StrongPass1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nickName');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with missing nickName', async () => {
      // Arrange
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.password = 'StrongPass1@';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nickName');
    });
  });

  describe('password validation', () => {
    it('should fail validation with password less than 10 characters', async () => {
      // Arrange
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';
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
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';
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
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';
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
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';
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
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });
  });

  describe('introduction validation', () => {
    it('should fail validation with non-string introduction', async () => {
      // Arrange
      const dto = new SignUpDto();
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';
      dto.password = 'StrongPass1@';
      // Using Object.defineProperty to bypass TypeScript type checking
      Object.defineProperty(dto, 'introduction', { value: 123 });

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('introduction');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
