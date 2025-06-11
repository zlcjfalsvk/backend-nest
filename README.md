# be-layered-example

## Stack
- Nestjs, Prisma ORM
- Postgresql

## Issue
- Prisma Orm 에서 Postgresql 에 대해 FTS (Full Text Index) 를 위한 인덱스 지원을 안함 [Link](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search#postgresql-1)
  - 인덱스를 사용하고 싶다면 Mysql 사용
- 예제에서는 AuthService 패스워드 암호화에서 argon2 알고리즘을 이용하여 해싱하지만 Production 환경에서 한국에서 서비스할 때는 argon2 사용못함 => KISA 표준 목록에 없기 때문에 pbkdf2-sha256 사용 해야 함