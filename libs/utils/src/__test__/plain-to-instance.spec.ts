import { describe, expect, it } from 'vitest';

import { snakeToCamel } from '../index';
import {
  configureMappings,
  getMappingOptions,
  MappingBuilder,
  type MappingOptions,
  mergeMappings,
  plainArrayToInstance,
  plainToInstance,
  withMapping,
} from '../plain-to-instance';

// ==================== 테스트용 DTO 클래스 ====================

class AddressDTO {
  street: string;
  city: string;
  zipCode: string;

  constructor() {
    this.street = '';
    this.city = '';
    this.zipCode = '00000';
  }
}

class PhoneDTO {
  type: string;
  number: string;

  constructor() {
    this.type = 'mobile';
    this.number = '';
  }
}

class UserDTO {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  age: number;
  address: AddressDTO;
  phones: PhoneDTO[];

  constructor() {
    this.id = 0;
    this.name = '';
    this.email = '';
    this.isActive = true;
    this.createdAt = new Date();
    this.age = 0;
    this.address = new AddressDTO();
    this.phones = [new PhoneDTO()];
  }
}

class UserProfileDTO {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  displayName: string;
  ageGroup: string;
  isAdult: boolean;
  metadata: string;

  constructor() {
    this.id = 0;
    this.firstName = '';
    this.lastName = '';
    this.fullName = '';
    this.email = '';
    this.displayName = '';
    this.ageGroup = '';
    this.isAdult = false;
    this.metadata = '';
  }
}

// ==================== 테스트 헬퍼 ====================

const createUserJson = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  isActive: true,
  age: 25,
  ...overrides,
});

const createMappedUserJson = (overrides = {}) => ({
  user_id: '123',
  full_name: 'John Doe',
  email_address: 'john@example.com',
  ...overrides,
});

// ==================== 테스트 스위트 ====================

describe('plainToDto', () => {
  // ========== 기본 타입 변환 테스트 ==========

  describe('기본 타입 변환', () => {
    it('문자열 타입을 올바르게 변환해야 한다', () => {
      const json = createUserJson();
      const result = plainToInstance(UserDTO, json);

      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('문자열을 숫자로 올바르게 캐스팅해야 한다', () => {
      const json = { id: '123', age: '25' };
      const result = plainToInstance(UserDTO, json);

      expect(result.id).toBe(123);
      expect(result.age).toBe(25);
      expect(typeof result.id).toBe('number');
      expect(typeof result.age).toBe('number');
    });

    it('문자열을 불린으로 올바르게 캐스팅해야 한다', () => {
      const testCases = [
        { input: 'true', expected: true },
        { input: 'false', expected: false },
        { input: 1, expected: true },
        { input: 0, expected: false },
        { input: 'yes', expected: true },
        { input: '', expected: false },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = plainToInstance(UserDTO, { isActive: input });
        expect(result.isActive).toBe(expected);
      });
    });

    it('문자열을 Date로 올바르게 캐스팅해야 한다', () => {
      const json = { createdAt: '2024-01-15T10:00:00Z' };
      const result = plainToInstance(UserDTO, json);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('유효하지 않은 날짜 문자열을 처리해야 한다', () => {
      const json = { createdAt: 'invalid-date' };
      const result = plainToInstance(UserDTO, json);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(isNaN(result.createdAt.getTime())).toBe(false);
    });
  });

  // ========== 중첩 객체 및 배열 테스트 ==========

  describe('중첩 객체 및 배열', () => {
    it('중첩된 DTO를 올바르게 변환해야 한다', () => {
      const json = {
        id: 1,
        address: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
        },
      };

      const result = plainToInstance(UserDTO, json);

      expect(result.address).toBeInstanceOf(AddressDTO);
      expect(result.address.street).toBe('123 Main St');
      expect(result.address.city).toBe('New York');
      expect(result.address.zipCode).toBe('10001');
    });

    it('DTO 배열을 올바르게 변환해야 한다', () => {
      const json = {
        id: 1,
        phones: [
          { type: 'home', number: '555-0100' },
          { type: 'work', number: '555-0200' },
        ],
      };

      const result = plainToInstance(UserDTO, json);

      expect(Array.isArray(result.phones)).toBe(true);
      expect(result.phones).toHaveLength(2);
      expect(result.phones[0]).toBeInstanceOf(PhoneDTO);
      expect(result.phones[0].type).toBe('home');
      expect(result.phones[1].type).toBe('work');
    });

    it('누락된 중첩 객체를 처리해야 한다', () => {
      const json = { id: 1, name: 'John' };
      const result = plainToInstance(UserDTO, json);

      expect(result.address).toBeInstanceOf(AddressDTO);
      expect(result.address.street).toBe('');
      expect(result.address.zipCode).toBe('00000');
    });

    it('빈 배열을 처리해야 한다', () => {
      const json = { id: 1, phones: [] };
      const result = plainToInstance(UserDTO, json);

      expect(Array.isArray(result.phones)).toBe(true);
      expect(result.phones).toHaveLength(0);
    });
  });

  // ========== 키 매핑 테스트 ==========

  describe('키 매핑', () => {
    it('간단한 키 매핑을 적용해야 한다', () => {
      const json = createMappedUserJson();

      const mappingOptions: MappingOptions<UserDTO> = {
        keyMappings: [
          { from: 'user_id', to: 'id' },
          { from: 'full_name', to: 'name' },
          { from: 'email_address', to: 'email' },
        ],
      };

      const result = plainToInstance(UserDTO, json, mappingOptions);

      expect(result.id).toBe(123);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('변환 함수와 함께 필드 매핑을 적용해야 한다', () => {
      const json = {
        user_id: '123',
        email_address: 'JOHN@EXAMPLE.COM',
        user_age: '999',
      };

      const mappingOptions: MappingOptions<UserDTO> = {
        fieldMappings: {
          id: { from: 'user_id' },
          email: {
            from: 'email_address',
            transform: (value) => value?.toLowerCase() || '',
          },
          age: {
            from: 'user_age',
            transform: (value) => {
              const age = Number(value);
              return age > 150 ? 150 : age < 0 ? 0 : age;
            },
          },
        },
      };

      const result = plainToInstance(UserDTO, json, mappingOptions);

      expect(result.id).toBe(123);
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(150);
    });

    it('전역 키 변환을 적용해야 한다', () => {
      const json = {
        id: '123',
        user_name: 'John',
        is_active: 'true',
        created_at: '2024-01-15T10:00:00Z',
      };

      const mappingOptions: MappingOptions<UserDTO> = {
        keyTransform: snakeToCamel,
        fieldMappings: {
          name: { from: 'user_name' },
        },
      };

      const result = plainToInstance(UserDTO, json, mappingOptions);

      expect(result.id).toBe(123);
      expect(result.name).toBe('John');
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('필드 매핑의 기본값을 사용해야 한다', () => {
      const json = { id: 1 };

      const mappingOptions: MappingOptions<UserDTO> = {
        fieldMappings: {
          name: { defaultValue: 'Default Name' },
          email: { defaultValue: 'default@example.com' },
        },
      };

      const result = plainToInstance(UserDTO, json, mappingOptions);

      expect(result.name).toBe('Default Name');
      expect(result.email).toBe('default@example.com');
    });
  });

  // ========== Computed 필드 테스트 ==========

  describe('Computed 필드 (JSON에 없는 필드 생성)', () => {
    type JsonDataType = any;
    const createComputedFieldMapping = (): MappingOptions<
      UserProfileDTO,
      JsonDataType
    > => ({
      keyMappings: [
        { from: 'user_id', to: 'id' },
        { from: 'first_name', to: 'firstName' },
        { from: 'last_name', to: 'lastName' },
      ],
      fieldMappings: {
        email: {
          transform: (value) => value?.toLowerCase() || '',
        },
        fullName: {
          computed: true,
          transform: (_, plainObj) =>
            `${plainObj.first_name} ${plainObj.last_name}`,
        },
        displayName: {
          computed: true,
          transform: (_, plainObj) => {
            if (plainObj.email) {
              return plainObj.email.split('@')[0];
            }
            return `${plainObj.first_name}_${plainObj.last_name}`.toLowerCase();
          },
        },
        ageGroup: {
          computed: true,
          transform: (_, plainObj) => {
            const age = plainObj.age;
            if (age < 18) {
              return 'minor';
            }
            if (age < 30) {
              return 'young adult';
            }
            if (age < 60) {
              return 'adult';
            }
            return 'senior';
          },
        },
        isAdult: {
          computed: true,
          transform: (_, plainObj) => plainObj.age >= 18,
        },
        metadata: {
          computed: true,
          transform: (_, plainObj) =>
            JSON.stringify({
              country: plainObj.country,
              source: 'web',
            }),
        },
      },
    });

    it('JSON에 없는 필드를 computed로 생성할 수 있어야 한다', () => {
      const json = {
        user_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        age: 25,
        country: 'USA',
      };

      const result = plainToInstance(
        UserProfileDTO,
        json,
        createComputedFieldMapping(),
      );

      expect(result.id).toBe(123);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.fullName).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.displayName).toBe('john.doe');
      expect(result.ageGroup).toBe('young adult');
      expect(result.isAdult).toBe(true);
      expect(result.metadata).toContain('"country":"USA"');
    });

    it('from: null로 JSON 매핑을 비활성화할 수 있어야 한다', () => {
      class TestDTO {
        id: number;
        name: string;
        generatedId: string;
        timestamp: Date;

        constructor() {
          this.id = 0;
          this.name = '';
          this.generatedId = '';
          this.timestamp = new Date();
        }
      }

      const mappingOptions: MappingOptions<TestDTO> = {
        fieldMappings: {
          generatedId: {
            from: null,
            computed: true,
            transform: () =>
              'generated_' + Math.random().toString(36).substr(2, 9),
          },
          timestamp: {
            computed: true,
            transform: () => new Date(),
          },
        },
      };

      const json = { id: 1, name: 'Test' };
      const result = plainToInstance(TestDTO, json, mappingOptions);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test');
      expect(result.generatedId).toContain('generated_');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('computed 필드에서 여러 JSON 필드를 조합할 수 있어야 한다', () => {
      class OrderDTO {
        price: number;
        taxRate: number;
        discount: number;
        totalPrice: number;

        constructor() {
          this.price = 0;
          this.taxRate = 0;
          this.discount = 0;
          this.totalPrice = 0;
        }
      }
      type JsonDataType = any;
      const mappingOptions: MappingOptions<OrderDTO, JsonDataType> = {
        keyMappings: [{ from: 'tax_rate', to: 'taxRate' }],
        fieldMappings: {
          totalPrice: {
            computed: true,
            transform: (_, plainObj) => {
              const subtotal = plainObj.price - plainObj.discount;
              const total = subtotal * (1 + plainObj.tax_rate);
              // 부동소수점 오류 방지를 위해 반올림
              return Math.round(total * 100) / 100;
            },
          },
        },
      };

      const json = {
        price: 100,
        tax_rate: 0.1,
        discount: 10,
      };

      const result = plainToInstance(OrderDTO, json, mappingOptions);

      expect(result.price).toBe(100);
      expect(result.taxRate).toBe(0.1);
      expect(result.discount).toBe(10);
      expect(result.totalPrice).toBe(99);
    });
  });

  // ========== 매핑 유틸리티 테스트 ==========

  describe('매핑 유틸리티', () => {
    describe('withMapping', () => {
      it('withMapping의 mapping 속성을 options 파라미터로 사용할 수 있어야 한다', () => {
        const MappedUserDTO = withMapping(UserDTO, {
          keyMappings: [
            { from: 'user_id', to: 'id' },
            { from: 'full_name', to: 'name' },
          ],
        });

        const json = createMappedUserJson();

        // MappedUserDTO 직접 사용
        const result1 = plainToInstance(MappedUserDTO, json);
        expect(result1.id).toBe(123);
        expect(result1.name).toBe('John Doe');

        // MappedUserDTO.mapping을 다른 변환에서 재사용
        const result2 = plainToInstance(UserDTO, json, MappedUserDTO.mapping);
        expect(result2.id).toBe(123);
        expect(result2.name).toBe('John Doe');
      });

      it('getMappingOptions 헬퍼를 사용할 수 있어야 한다', () => {
        const MappedDTO = withMapping(UserDTO, {
          keyMappings: [{ from: 'user_id', to: 'id' }],
        });

        const mappingOptions = getMappingOptions(MappedDTO);

        expect(mappingOptions).toBeDefined();
        expect(mappingOptions?.keyMappings).toHaveLength(1);
        expect(mappingOptions?.keyMappings?.[0].from).toBe('user_id');
      });
    });

    describe('configureMappings', () => {
      it('configureMappings로 설정된 매핑을 사용해야 한다', () => {
        class TestDTO {
          id: number;
          name: string;

          constructor() {
            this.id = 0;
            this.name = '';
          }
        }

        configureMappings(TestDTO, {
          keyMappings: [
            { from: 'test_id', to: 'id' },
            { from: 'test_name', to: 'name' },
          ],
        });

        const json = { test_id: '42', test_name: 'Test' };
        const result = plainToInstance(TestDTO, json);

        expect(result.id).toBe(42);
        expect(result.name).toBe('Test');
      });
    });

    describe('mergeMappings', () => {
      it('mergeMappings로 매핑을 병합할 수 있어야 한다', () => {
        const baseMapping: MappingOptions<UserDTO> = {
          keyMappings: [{ from: 'user_id', to: 'id' }],
        };

        const extendedMapping: MappingOptions<UserDTO> = {
          fieldMappings: {
            email: {
              transform: (value: string) => value?.toUpperCase() || '',
            },
          },
        };

        const mergedMapping = mergeMappings<UserDTO>(
          baseMapping,
          extendedMapping,
        );
        const json = { user_id: '123', email: 'john@example.com' };
        const result = plainToInstance(UserDTO, json, mergedMapping);

        expect(result.id).toBe(123);
        expect(result.email).toBe('JOHN@EXAMPLE.COM');
      });
    });

    describe('MappingBuilder', () => {
      it('빌더 패턴으로 매핑을 구성할 수 있어야 한다', () => {
        const UserDTOWithBuilder = new MappingBuilder<UserDTO>()
          .addKeyMapping('user_id', 'id')
          .addKeyMapping('user_name', 'name')
          .addFieldMapping('email', {
            from: 'user_email',
            transform: (value) => value?.toLowerCase() || '',
          })
          .setStrict(true)
          .applyTo(UserDTO);

        const json = {
          user_id: '123',
          user_name: 'John Doe',
          user_email: 'JOHN@EXAMPLE.COM',
        };

        const result = plainToInstance(UserDTOWithBuilder, json);

        expect(result.id).toBe(123);
        expect(result.name).toBe('John Doe');
        expect(result.email).toBe('john@example.com');
      });

      it('빌더의 build 메서드로 매핑 옵션을 생성할 수 있어야 한다', () => {
        const mappingOptions = new MappingBuilder<UserDTO>()
          .addKeyMapping('user_id', 'id')
          .setIncludeUnmapped(true)
          .build();

        expect(mappingOptions.keyMappings).toHaveLength(1);
        expect(mappingOptions.includeUnmapped).toBe(true);
      });
    });
  });

  // ========== 배열 변환 테스트 ==========

  describe('배열 변환', () => {
    it('plain 객체 배열을 DTO로 변환해야 한다', () => {
      const jsonArray = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
        { id: '3', name: 'User 3', email: 'user3@example.com' },
      ];

      const results = plainArrayToInstance(UserDTO, jsonArray);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toBeInstanceOf(UserDTO);
        expect(result.id).toBe(index + 1);
        expect(result.name).toBe(`User ${index + 1}`);
      });
    });

    it('배열 변환에 매핑을 적용해야 한다', () => {
      const jsonArray = [
        { user_id: '1', full_name: 'User 1' },
        { user_id: '2', full_name: 'User 2' },
      ];

      const mappingOptions: MappingOptions<UserDTO> = {
        keyMappings: [
          { from: 'user_id', to: 'id' },
          { from: 'full_name', to: 'name' },
        ],
      };

      const results = plainArrayToInstance(UserDTO, jsonArray, mappingOptions);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(1);
      expect(results[0].name).toBe('User 1');
      expect(results[1].id).toBe(2);
      expect(results[1].name).toBe('User 2');
    });
  });

  // ========== 엣지 케이스 및 보안 테스트 ==========

  describe('엣지 케이스 및 보안', () => {
    it('null 입력을 처리해야 한다', () => {
      const result = plainToInstance(UserDTO, null);

      expect(result).toBeInstanceOf(UserDTO);
      expect(result.id).toBe(0);
      expect(result.name).toBe('');
    });

    it('undefined 입력을 처리해야 한다', () => {
      const result = plainToInstance(UserDTO, undefined);

      expect(result).toBeInstanceOf(UserDTO);
      expect(result.id).toBe(0);
      expect(result.name).toBe('');
    });

    it('빈 객체를 처리해야 한다', () => {
      const result = plainToInstance(UserDTO, {});

      expect(result).toBeInstanceOf(UserDTO);
      expect(result.id).toBe(0);
      expect(result.name).toBe('');
      expect(result.isActive).toBe(true);
    });

    it('스키마에 없는 속성을 무시해야 한다', () => {
      const json = {
        id: 1,
        name: 'John',
        maliciousField: 'hack',
        anotherBadField: 'attack',
      };

      const result = plainToInstance(UserDTO, json);

      expect(result.id).toBe(1);
      expect(result.name).toBe('John');
      expect((result as any).maliciousField).toBeUndefined();
      expect((result as any).anotherBadField).toBeUndefined();
    });

    it('중첩 객체의 추가 필드를 무시해야 한다', () => {
      const json = {
        id: 1,
        address: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          extraField: 'should-be-ignored',
        },
      };

      const result = plainToInstance(UserDTO, json);

      expect(result.address.street).toBe('123 Main St');
      expect((result.address as any).extraField).toBeUndefined();
    });

    it('깊게 중첩된 구조를 처리해야 한다', () => {
      class Level3DTO {
        value: string;
        constructor() {
          this.value = '';
        }
      }

      class Level2DTO {
        level3: Level3DTO;
        constructor() {
          this.level3 = new Level3DTO();
        }
      }

      class Level1DTO {
        level2: Level2DTO;
        constructor() {
          this.level2 = new Level2DTO();
        }
      }

      const json = {
        level2: {
          level3: {
            value: 'deep-value',
          },
        },
      };

      const result = plainToInstance(Level1DTO, json);

      expect(result.level2).toBeInstanceOf(Level2DTO);
      expect(result.level2.level3).toBeInstanceOf(Level3DTO);
      expect(result.level2.level3.value).toBe('deep-value');
    });

    it('유효하지 않은 중첩 객체를 처리해야 한다', () => {
      const json = {
        id: 1,
        name: 'John',
        address: 'not-an-object', // 문자열이지만 객체를 기대
      };

      const result = plainToInstance(UserDTO, json);

      // address는 문자열이므로 처리되지 않고 기본값이 유지됨
      expect(result.address).toBeInstanceOf(AddressDTO);
      expect(result.address.street).toBe('');
      expect(result.address.city).toBe('');
      expect(result.address.zipCode).toBe('00000');
    });

    it('유효하지 않은 배열 값을 처리해야 한다', () => {
      const json = {
        id: 1,
        phones: 'not-an-array', // 문자열이지만 배열을 기대
      };

      const result = plainToInstance(UserDTO, json);

      // phones는 문자열이므로 처리되지 않고 기본값이 유지됨
      expect(Array.isArray(result.phones)).toBe(true);
      expect(result.phones).toHaveLength(1); // 생성자의 기본값
      expect(result.phones[0]).toBeInstanceOf(PhoneDTO);
    });
  });

  // ========== 성능 테스트 ==========

  describe('성능', () => {
    it('반복 변환을 위해 스키마를 캐시해야 한다', () => {
      const json = { id: '1', name: 'Test' };
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        plainToInstance(UserDTO, json);
      }
      const duration = performance.now() - start;

      // 캐싱으로 인해 빠르게 실행되어야 함
      expect(duration).toBeLessThan(100);
    });

    it('대량 데이터 변환을 효율적으로 처리해야 한다', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      const start = performance.now();
      const results = plainArrayToInstance(UserDTO, largeArray);
      const duration = performance.now() - start;

      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(50);
    });
  });
});
