# be-layered-example

## Stack
- Nestjs, Prisma ORM
- Postgresql

## Issue
- Prisma Orm 에서 Postgresql 에 대해 FTS (Full Text Index) 를 위한 인덱스 지원을 안함 [Link](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search#postgresql-1)
  - 인덱스를 사용하고 싶다면 Mysql 사용