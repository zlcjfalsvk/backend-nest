import { validate } from 'class-validator';

import { IsStrongPassword } from '@libs/utils';

class TestUser {
  @IsStrongPassword()
  password: string;

  constructor(password: string) {
    this.password = password;
  }
}

describe('IsStrongPassword Decorator', () => {
  it('대문자, 소문자, 특수 문자를 포함하고 최소 10자 이상인 유효한 비밀번호는 검증을 통과해야 한다', async () => {
    // Arrange
    const user = new TestUser('ValidPass1@');

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('10자 이상이지만 대문자가 없는 비밀번호는 검증에 실패해야 한다', async () => {
    // Arrange
    const user = new TestUser('invalidpass@');

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });

  it('10자 이상이지만 소문자가 없는 비밀번호는 검증에 실패해야 한다', async () => {
    // Arrange
    const user = new TestUser('INVALIDPASS@');

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });

  it('10자 이상이지만 특수 문자가 없는 비밀번호는 검증에 실패해야 한다', async () => {
    // Arrange
    const user = new TestUser('InvalidPass1');

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });

  it('모든 필수 문자 유형을 포함하지만 10자 미만인 비밀번호는 검증에 실패해야 한다', async () => {
    // Arrange
    const user = new TestUser('Valid@1A');

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });

  it('문자열이 아닌 값은 검증에 실패해야 한다', async () => {
    // Arrange
    const user = new TestUser(123 as any);

    // Act
    const errors = await validate(user);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });
});
