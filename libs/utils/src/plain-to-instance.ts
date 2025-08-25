interface KeyMapping {
  from: string;
  to: string;
}

// 필드별 상세 매핑 옵션
interface FieldMapping<T = any, P = unknown> {
  from?: string | null;
  transform?: (value: T | undefined, plainObject?: P) => T | undefined;
  defaultValue?: T;
  computed?: boolean;
}

// 타입 안전한 필드 매핑
type TypedFieldMappings<T, P> = {
  [K in keyof T]?: FieldMapping<T[K], P>;
};

// 전체 매핑 옵션
interface MappingOptions<T = any, P = unknown> {
  keyMappings?: KeyMapping[];
  fieldMappings?: T extends object
    ? TypedFieldMappings<T, P>
    : Record<string, FieldMapping>;
  keyTransform?: (jsonKey: string) => string;
  strict?: boolean;
  includeUnmapped?: boolean;
}

// withMapping으로 확장된 클래스 타입
type WithMappingClass<T extends new (...args: any[]) => any> = T & {
  mapping: MappingOptions<InstanceType<T>>;
  setMapping: (options: MappingOptions<InstanceType<T>>) => void;
};

// 스키마 정보 타입
interface SchemaInfo {
  type: string;
  defaultValue: any;
  DTOClass?: new (...args: any[]) => any;
  arrayItemClass?: new (...args: any[]) => any;
}

// ==================== 타입 가드 ====================

class TypeGuards {
  static isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  static isDate(value: unknown): value is Date {
    return value instanceof Date;
  }

  static isConstructor(value: unknown): value is new (...args: any[]) => any {
    return typeof value === 'function' && value.prototype !== undefined;
  }

  static isNullOrUndefined(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }
}

// ==================== 타입 캐스팅 ====================

class TypeCaster {
  static toString(value: unknown): string {
    if (TypeGuards.isNullOrUndefined(value)) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  }

  static toNumber(value: unknown): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  static toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true' || value === 1) {
      return true;
    }
    if (value === 'false' || value === 0) {
      return false;
    }
    return Boolean(value);
  }

  static toDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  }
}

// ==================== 스키마 관리 ====================

class SchemaManager {
  private static cache = new WeakMap<
    new (...args: any[]) => any,
    Map<string, SchemaInfo>
  >();

  static inferType(value: any): string {
    if (TypeGuards.isNullOrUndefined(value)) {
      return 'any';
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (TypeGuards.isDate(value)) {
      return 'date';
    }
    if (TypeGuards.isArray(value)) {
      return 'array';
    }
    if (TypeGuards.isObject(value)) {
      return 'object';
    }
    return 'any';
  }

  static inferSchema<T extends object>(
    DTOClass: new (...args: any[]) => T,
  ): Map<string, SchemaInfo> {
    const cached = this.cache.get(DTOClass);
    if (cached) {
      return cached;
    }

    const schema = new Map<string, SchemaInfo>();
    const tempInstance = new DTOClass();

    for (const key of Object.keys(tempInstance)) {
      const value = (tempInstance as any)[key];
      const schemaInfo: SchemaInfo = {
        type: this.inferType(value),
        defaultValue: value,
      };

      if (TypeGuards.isObject(value) && value.constructor !== Object) {
        schemaInfo.DTOClass = value.constructor as new (...args: any[]) => any;
      }

      if (TypeGuards.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (
          TypeGuards.isObject(firstItem) &&
          firstItem.constructor !== Object
        ) {
          schemaInfo.arrayItemClass = firstItem.constructor as new (
            ...args: any[]
          ) => any;
        }
      }

      schema.set(key, schemaInfo);
    }

    this.cache.set(DTOClass, schema);
    return schema;
  }
}

// ==================== 매핑 관리 ====================

class MappingManager {
  private static store = new WeakMap<
    new (...args: any[]) => any,
    MappingOptions<any>
  >();

  static register<T>(
    DTOClass: new (...args: any[]) => T,
    options: MappingOptions<T>,
  ): void {
    this.store.set(DTOClass, options);
  }

  static get<T>(
    DTOClass: new (...args: any[]) => T,
  ): MappingOptions<T> | undefined {
    return this.store.get(DTOClass);
  }

  static getEffectiveOptions<T>(
    DTOClass: new (...args: any[]) => T,
    options?: MappingOptions<T>,
  ): MappingOptions<T> | undefined {
    return options || (DTOClass as any).mapping || this.get(DTOClass);
  }
}

// ==================== 값 변환 처리 ====================

class ValueProcessor {
  static processValue(
    value: any,
    schemaInfo: SchemaInfo,
    mappingOptions?: MappingOptions<any>,
  ): any {
    switch (schemaInfo.type) {
      case 'string':
        return TypeCaster.toString(value);
      case 'number':
        return TypeCaster.toNumber(value);
      case 'boolean':
        return TypeCaster.toBoolean(value);
      case 'date':
        return TypeCaster.toDate(value);
      case 'object':
        return this.processObject(value, schemaInfo);
      case 'array':
        return this.processArray(value, schemaInfo);
      default:
        return value;
    }
  }

  private static processObject(value: any, schemaInfo: SchemaInfo): any {
    if (schemaInfo.DTOClass && TypeGuards.isObject(value)) {
      const nestedOptions = (schemaInfo.DTOClass as any).mapping;
      return plainToDto(schemaInfo.DTOClass, value, nestedOptions);
    }
    // 값이 유효하지 않으면 기본값 반환
    if (TypeGuards.isObject(value)) {
      return value;
    }
    // 잘못된 타입인 경우 스키마의 기본값 반환
    return schemaInfo.defaultValue;
  }

  private static processArray(value: any, schemaInfo: SchemaInfo): any {
    if (!TypeGuards.isArray(value)) {
      // 배열이 아니면 스키마의 기본값 반환
      return schemaInfo.defaultValue;
    }

    if (schemaInfo.arrayItemClass) {
      const itemOptions = (schemaInfo.arrayItemClass as any).mapping;
      return value.map((item) =>
        TypeGuards.isObject(item)
          ? plainToDto(schemaInfo.arrayItemClass!, item, itemOptions)
          : item,
      );
    }

    return value;
  }
}

// ==================== 매핑 처리 ====================

class MappingProcessor {
  private jsonToDtoKeyMap = new Map<string, string>();
  private computedFields = new Set<string>();

  constructor(private mappingOptions?: MappingOptions<any>) {
    this.initializeMappings();
  }

  mapJsonKeyToDtoKey(jsonKey: string): string {
    const mapped = this.jsonToDtoKeyMap.get(jsonKey);
    if (mapped) {
      return mapped;
    }

    if (this.mappingOptions?.keyTransform) {
      return this.mappingOptions.keyTransform(jsonKey);
    }

    return jsonKey;
  }

  getComputedFields(): Set<string> {
    return this.computedFields;
  }

  applyTransform(dtoKey: string, value: any, plainObject: any): any {
    const fieldMapping = this.mappingOptions?.fieldMappings?.[dtoKey];
    if (fieldMapping?.transform) {
      return fieldMapping.transform(value, plainObject);
    }
    return value;
  }

  getDefaultValue(dtoKey: string): any {
    const fieldMapping = this.mappingOptions?.fieldMappings?.[dtoKey];
    return fieldMapping?.defaultValue;
  }

  shouldIncludeUnmapped(): boolean {
    return this.mappingOptions?.includeUnmapped || false;
  }

  private initializeMappings(): void {
    if (!this.mappingOptions) {
      return;
    }

    // fieldMappings 처리
    if (this.mappingOptions.fieldMappings) {
      for (const [dtoKey, fieldMapping] of Object.entries(
        this.mappingOptions.fieldMappings,
      )) {
        const mapping = fieldMapping as FieldMapping;

        if (mapping.computed) {
          this.computedFields.add(dtoKey);
        } else if (mapping.from !== null) {
          const jsonKey = mapping.from || dtoKey;
          this.jsonToDtoKeyMap.set(jsonKey, dtoKey);
        }
      }
    }

    // keyMappings 처리
    if (this.mappingOptions.keyMappings) {
      for (const mapping of this.mappingOptions.keyMappings) {
        this.jsonToDtoKeyMap.set(mapping.from, mapping.to);
      }
    }
  }
}

// ==================== 공개 API ====================

/**
 * DTO 클래스에 매핑 설정을 등록
 */
const configureMappings = <T>(
  DTOClass: new (...args: any[]) => T,
  options: MappingOptions<T>,
): void => {
  MappingManager.register(DTOClass, options);
};

/**
 * DTO 클래스에 정적 매핑 메서드 추가
 */
const withMapping = <T extends new (...args: any[]) => any>(
  DTOClass: T,
  options: MappingOptions<InstanceType<T>>,
): WithMappingClass<T> => {
  const ExtendedClass = DTOClass as WithMappingClass<T>;
  ExtendedClass.mapping = options;
  ExtendedClass.setMapping = (newOptions: MappingOptions<InstanceType<T>>) => {
    ExtendedClass.mapping = newOptions;
  };
  return ExtendedClass;
};

/**
 * withMapping이 적용된 클래스에서 매핑 옵션 추출
 */
const getMappingOptions = <T extends new (...args: any[]) => any>(
  DTOClass: T | WithMappingClass<T>,
): MappingOptions<InstanceType<T>> | undefined => {
  return (DTOClass as any).mapping;
};

/**
 * 여러 매핑 옵션 병합
 */
const mergeMappings = <T>(
  ...mappings: (MappingOptions<T> | undefined)[]
): MappingOptions<T> => {
  const result: MappingOptions<T> = {};

  for (const mapping of mappings) {
    if (!mapping) {
      continue;
    }

    if (mapping.keyMappings) {
      result.keyMappings = [
        ...(result.keyMappings || []),
        ...mapping.keyMappings,
      ];
    }

    if (mapping.fieldMappings) {
      result.fieldMappings = {
        ...result.fieldMappings,
        ...mapping.fieldMappings,
      };
    }

    if (mapping.keyTransform) {
      result.keyTransform = mapping.keyTransform;
    }

    if (mapping.strict !== undefined) {
      result.strict = mapping.strict;
    }

    if (mapping.includeUnmapped !== undefined) {
      result.includeUnmapped = mapping.includeUnmapped;
    }
  }

  return result;
};

type Constructor<T> = new (...args: any[]) => T;
/**
 * Plain object를 DTO 인스턴스로 변환
 */
const plainToDto = <T extends object, P = unknown>(
  DTOClass: Constructor<T>,
  plainObject: P,
  options?: MappingOptions<T, P>,
): T => {
  const instance = new DTOClass();

  if (!TypeGuards.isObject(plainObject)) {
    return instance;
  }

  const mappingOptions = MappingManager.getEffectiveOptions(DTOClass, options);
  const schema = SchemaManager.inferSchema(DTOClass);
  const processor = new MappingProcessor(mappingOptions);
  const processedDtoKeys = new Set<string>();

  // JSON 객체의 키들을 순회하여 처리
  processJsonKeys(
    plainObject,
    instance,
    schema,
    processor,
    processedDtoKeys,
    mappingOptions,
  );

  // Computed 필드 처리
  processComputedFields(
    plainObject,
    instance,
    schema,
    processor,
    processedDtoKeys,
    mappingOptions,
  );

  // 처리되지 않은 필드에 defaultValue 적용
  applyDefaultValues(instance, processedDtoKeys, mappingOptions);

  return instance;
};

/**
 * Plain object 배열을 DTO 인스턴스 배열로 변환
 */
const plainArrayToDto = <T extends object>(
  DTOClass: new (...args: any[]) => T,
  plainArray: unknown[],
  options?: MappingOptions<T>,
): T[] => {
  return plainArray.map((item) => plainToDto(DTOClass, item, options));
};

// ==================== 내부 헬퍼 함수 ====================

function processJsonKeys<T extends object>(
  plainObject: Record<string, unknown>,
  instance: T,
  schema: Map<string, SchemaInfo>,
  processor: MappingProcessor,
  processedDtoKeys: Set<string>,
  mappingOptions?: MappingOptions<T>,
): void {
  for (const jsonKey of Object.keys(plainObject)) {
    const dtoKey = processor.mapJsonKeyToDtoKey(jsonKey);

    if (!schema.has(dtoKey)) {
      if (processor.shouldIncludeUnmapped()) {
        (instance as any)[jsonKey] = plainObject[jsonKey];
      }
      continue;
    }

    const schemaInfo = schema.get(dtoKey)!;
    let value = plainObject[jsonKey];

    // Transform 적용
    value = processor.applyTransform(dtoKey, value, plainObject);

    // DefaultValue 처리
    if (TypeGuards.isNullOrUndefined(value)) {
      const defaultValue = processor.getDefaultValue(dtoKey);
      if (defaultValue !== undefined) {
        value = defaultValue;
      }
    }

    if (!TypeGuards.isNullOrUndefined(value)) {
      processedDtoKeys.add(dtoKey);
      const processedValue = ValueProcessor.processValue(
        value,
        schemaInfo,
        mappingOptions,
      );

      // processValue가 undefined를 반환하지 않은 경우에만 할당
      if (processedValue !== undefined) {
        (instance as any)[dtoKey] = processedValue;
      }
    }
  }
}

function processComputedFields<T extends object>(
  plainObject: Record<string, unknown>,
  instance: T,
  schema: Map<string, SchemaInfo>,
  processor: MappingProcessor,
  processedDtoKeys: Set<string>,
  mappingOptions?: MappingOptions<T>,
): void {
  const computedFields = processor.getComputedFields();

  for (const dtoKey of computedFields) {
    if (!schema.has(dtoKey)) {
      continue;
    }

    const schemaInfo = schema.get(dtoKey)!;
    let value = processor.applyTransform(dtoKey, undefined, plainObject);

    if (TypeGuards.isNullOrUndefined(value)) {
      const defaultValue = processor.getDefaultValue(dtoKey);
      if (defaultValue !== undefined) {
        value = defaultValue;
      }
    }

    if (!TypeGuards.isNullOrUndefined(value)) {
      processedDtoKeys.add(dtoKey);
      (instance as any)[dtoKey] = ValueProcessor.processValue(
        value,
        schemaInfo,
        mappingOptions,
      );
    }
  }
}

function applyDefaultValues<T extends object>(
  instance: T,
  processedDtoKeys: Set<string>,
  mappingOptions?: MappingOptions<T>,
): void {
  if (!mappingOptions?.fieldMappings) {
    return;
  }

  for (const [dtoKey, fieldMapping] of Object.entries(
    mappingOptions.fieldMappings,
  )) {
    if (
      !processedDtoKeys.has(dtoKey) &&
      (fieldMapping as FieldMapping).defaultValue !== undefined
    ) {
      (instance as any)[dtoKey] = (fieldMapping as FieldMapping).defaultValue;
    }
  }
}

// ==================== 매핑 빌더 ====================

/**
 * 매핑을 체이닝 가능한 빌더 패턴
 */
export class MappingBuilder<T extends object> {
  private options: MappingOptions<T> = {};

  addKeyMapping(from: string, to: string): this {
    if (!this.options.keyMappings) {
      this.options.keyMappings = [];
    }
    this.options.keyMappings.push({ from, to });
    return this;
  }

  addFieldMapping<K extends keyof T>(
    field: K,
    mapping: FieldMapping<T[K]>,
  ): this {
    if (!this.options.fieldMappings) {
      this.options.fieldMappings = {} as any;
    }
    (this.options.fieldMappings as any)[field] = mapping;
    return this;
  }

  setKeyTransform(transform: (jsonKey: string) => string): this {
    this.options.keyTransform = transform;
    return this;
  }

  setStrict(strict: boolean): this {
    this.options.strict = strict;
    return this;
  }

  setIncludeUnmapped(include: boolean): this {
    this.options.includeUnmapped = include;
    return this;
  }

  build(): MappingOptions<T> {
    return this.options;
  }

  applyTo<C extends new (...args: any[]) => T>(
    DTOClass: C,
  ): WithMappingClass<C> {
    return withMapping(
      DTOClass,
      this.options as MappingOptions<InstanceType<C>>,
    );
  }
}

// ==================== EXPORTS ====================

// 함수 exports
export {
  configureMappings,
  withMapping,
  getMappingOptions,
  mergeMappings,
  plainToDto,
  plainArrayToDto,
};

// 타입 exports (외부에서 사용 가능하도록)
export type {
  KeyMapping,
  FieldMapping,
  TypedFieldMappings,
  MappingOptions,
  WithMappingClass,
};
