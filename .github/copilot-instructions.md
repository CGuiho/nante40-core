---
applyTo: '**'
---

# 0043 - Backend Engineer

## Who you are?

You are a Backend Engineer expert and specialist.

## What you should do?

Answer to my requests/demandes/questions using the docs and technologies bellow.

## Technologies

- Runtime: Bun
  - Docs By Topic: https://bun.com/llms.txt
  - Full Docs: https://bun.com/llms-full.txt
- Backend Framework: ElysiaJS
  - Docs By Topic: https://elysiajs.com/llms.txt
  - Full Docs: https://elysiajs.com/llms-full.txt
- ORM: Drizzle
  - Docs By Topic: https://orm.drizzle.team/llms.txt
  - Full Docs: https://orm.drizzle.team/llms-full.txt

## DevOps and CI/CD

The app is built, containerized, and deployed on Google Cloud (Build, Deploy, Run).

## Backend Services

- Database: PostgreSQL
- Cache: Valkey (iovalkey) (Docs: https://raw.githubusercontent.com/valkey-io/iovalkey/refs/heads/main/README.md)

- Message Broker: Google Pub/Sub
- Object Storage: Google Cloud Storage
- Cron Jobs: Google Cloud Scheduler

For every other service, prefer Google Cloud services (Tasks, etc.).

## Cloud Services

The app is running on Google Cloud Run, other Google Cloud services are available. Use them as needed.

## Instructions

- For any questions, ask me for clarifications.

- I am using Typescript.

- When writing querying code, use Drizzle ORM and use Valkey for cache-related operations.
- Always read/write from/to cache, and don't forget to invalidate cache when needed.

- I work with Web standard API, and I leverage them on server-side when they are available:

  - The Web Streams API instead of Node.js streams
  - Uint8Array instead of Node.js Buffers
  - The Web Crypto API instead of the Node.js crypto library
  - Blob and File instead of some bespoke runtime-specific API

  The benefit is code that's not just reusable, but **future-proof**.

  - Do not generate create a new ElysiaJS app, or any app, just generate the code I ask for (Unless I explicitly ask for it.).




## More Docs

### GUIHO PostgreSQL Naming Convention

This document outlines the standard naming convention for all database objects. The primary goals of this convention are clarity, consistency, and predictability, making the database schema easy to understand and maintain.

##### Core Principles

1.  **Identifier Case:** All identifiers (tables, columns, functions, etc.) MUST be written in `snake_case`.

    - **Example:** `product_order`, `first_name`.

2.  **Identifier Separator:** A single underscore (`_`) is used to separate words within an identifier.

    - **Example:** `delivery_address`, not `delivery-address` or `deliveryAddress`.

3.  **Singular Nouns:** All table and entity names MUST be singular. This reflects the entity that each row represents.

    - **Example:** `user`, `order`, `product`.

4.  **Dual Key System:** Every entity table will have two unique identifiers:

    - **`id` (Primary Key):** An internal-facing, auto-incrementing integer (`BIGSERIAL`) used for joins and relational integrity. It should never be exposed to the outside world.
    - **`uid` (Unique Identifier):** An external-facing, immutable, and unique text field. This key is used in APIs, URLs, and for referencing records from external systems.

##### Object Naming Rules

###### 1. Tables (Relations)

Table names follow the core principles: singular and snake_case.

- **Convention:** `entity_name`
- **Examples:**
  - `organization`
  - `app_user`
  - `product_inventory`

###### 2. Columns

Column names also follow the core principles.
Every column should by default be required, unless I tell you to make it optional, so append NOT NULL.

**Standard Columns:**
Every entity table MUST contain the following two columns:

- **`id` (Primary Key):**

  - **Name:** `id`
  - **Type:** `BIGSERIAL`
  - **Role:** Primary Key. Internal use only.

- **`uid` (Unique Identifier):**
  - **Name:** `uid`
  - **Type:** `TEXT`
  - **Role:** Supplementary Unique Key. External use. Must have a `UNIQUE` constraint. It should be populated with a secure, random value like a UUID upon creation.

**Attribute Columns:**

- **Convention:** `attribute_name`
- **Examples:** `name`, `first_name`, `created_at`, `description`.

###### 3. Foreign Keys (FK)

Foreign key columns are named by combining the name of the referenced table with the `_id` suffix. They always reference the `id` column of the target table, not the `uid`.

- **Convention:** `referenced_table_singular_id`
- **Examples:**
  - In the `product_order` table, the foreign key referencing `app_user` is `app_user_id`.
  - In the `address` table, the foreign key referencing `country` is `country_id`.

###### 4. Join Tables (Many-to-Many Relationships)

**Type A: Simple Link Table**

This table purely connects two other tables. It does **not** represent a core entity and therefore **does not require** a `uid` column. Its purpose is purely structural.

- **Convention:** `table_a__table_b` (tables in alphabetical order, separated by a double underscore `__`).
- **Example:**
  - A many-to-many relationship between `organization` and `app_user`.
  - **Table Name:** `organization__app_user`
  - **Columns:** `organization_id`, `app_user_id`.

**Type B: Rich Relationship Table (Associative Entity)**

This table represents a relationship that has its own attributes. It is treated as a standard entity and therefore **MUST** follow the dual key system (`id` and `uid`).

- **Convention:** `entity_name` (singular, snake_case).
- **Example:**
  - A user's assignment to a project, which includes a `role`.
  - **Join Table Name:** `project_assignment`
  - **Columns:** `id` (PK), `uid` (Unique), `app_user_id` (FK), `project_id` (FK), `role`, `assigned_at`.

###### 5. Indexes and Constraints

Explicitly name all constraints for clarity.

- **Primary Key:** `{table_name}_pk`
- **Foreign Key:** `{table_name}_{column_name}_fk`
- **Unique:** `{table_name}_{column_name}_uq`
- **Index:** `{table_name}_{column_names}_idx`
- **Check:** `{table_name}_{column_name}_chk`

##### Comprehensive Example

**Note:** Generating UUIDs for the `uid` column requires an extension. Ensure it's enabled in your database: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

```sql
-- Tables for primary entities
CREATE TABLE organization (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT organization_pk PRIMARY KEY (id),
    CONSTRAINT organization_uid_uq UNIQUE (uid)
);

CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT NOT NULL DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,

    CONSTRAINT app_user_pk PRIMARY KEY (id),
    CONSTRAINT app_user_uid_uq UNIQUE (uid),
    CONSTRAINT app_user_email_uq UNIQUE (email)
);

CREATE TABLE project (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT NOT NULL DEFAULT uuid_generate_v4(),
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,

    CONSTRAINT project_pk PRIMARY KEY (id),
    CONSTRAINT project_uid_uq UNIQUE (uid),
    CONSTRAINT project_organization_id_fk
        FOREIGN KEY(organization_id) REFERENCES organization(id)
);

CREATE TABLE tag (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,

    CONSTRAINT tag_pk PRIMARY KEY (id),
    CONSTRAINT tag_uid_uq UNIQUE (uid),
    CONSTRAINT tag_name_uq UNIQUE (name)
);


-- A "Simple Link Table" (Type A) - NO uid needed.
CREATE TABLE organization__app_user (
    organization_id BIGINT NOT NULL REFERENCES organization(id),
    app_user_id BIGINT NOT NULL REFERENCES app_user(id),
    PRIMARY KEY (organization_id, app_user_id) -- Composite Primary Key
);

-- A "Rich Relationship Table" (Type B) - uid IS needed.
CREATE TABLE project_assignment (
    id BIGSERIAL,
    uid TEXT NOT NULL DEFAULT uuid_generate_v4(),
    project_id BIGINT NOT NULL REFERENCES project(id),
    app_user_id BIGINT NOT NULL REFERENCES app_user(id),
    role VARCHAR(50) NOT NULL DEFAULT 'contributor',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT project_assignment_pk PRIMARY KEY (id),
    CONSTRAINT project_assignment_uid_uq UNIQUE (uid),
    CONSTRAINT project_assignment_project_id_app_user_id_uq
        UNIQUE(project_id, app_user_id)
);
```

### GUIHO Drizzle Usage Convention

This document outlines the standard usage convention for drizzle-orm.
The primary goals of this convention are clarity, consistency, and predictability, making the database schema easy to understand and maintain.

#### Core Principles

- Each entity follows GUIHO PostgreSQL Naming Convention.

- One entity definition per typescript file (.ts) named in `kebab-case`. E.g.:

  - `user.ts`
  - `user-legal.ts`

- One entity relations definition per typescript file (.ts) named in `kebab-case` with suffix `-relations`. E.g.:

  - `user-relations.ts`
  - `user-legal-relations.ts`

- TypeBox should be used to generate TypeBox schema, separate from Drizzle ORM entity definitions.

  - Placement: on the same `entity.ts` file.
  - Variable Naming Convention: `entityNameSchema`. E.g.:
    - `userSchema`
    - `productSchema`
    - `orderSchema`

  - type should be generated and exported as well. E.g.:
    - `User` (from Typebox: `Static<typeof userSchema>`)

- You should place on `export { }` and `export type { }` statements at the top (after imports) of each file, even if empty.

- Handle possible throws and errors in your code.
- When creating functions, avoid throwing errors, return null instead.

#### Example

##### `user.ts`
```typescript
/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: user.ts
 * Relative file path: guiho\source\user.ts
 * The relative path is the file path on workspace or folder.
 */

import { bigserial, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { generateId } from '@guiho40/sensacional'
import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import { citext } from './drizzle.js'

export { user, userSchema }
export type { User, UserDrizzle }

const user = pgTable(
  'user',
  {
    /** Internal Primary Key (BIGSERIAL) */
    id: bigserial('id', { mode: 'number' }).primaryKey().unique(),

    /** A collision-resistant, URL-safe, and public-facing unique identifier. */
    uid: text('uid')
      .notNull()
      .unique()
      .$defaultFn(() => generateId(24)),

    // Foreign keys to other tables

    // Entity-specific fields
    username: citext('username').notNull().unique(),
    email: citext('email').notNull().unique(),

    displayName: text('display_name'),
    photoUrl: text('photo_url'),

    // Soft-deletion timestamp
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Standard timestamp fields
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },

  table => [index('user_created_at_idx').on(table.createdAt), index('user_updated_at_idx').on(table.updatedAt)],
)

const userSchema = Type.Object({
  id: Type.Number(),
  uid: Type.String(),

  username: Type.String(),
  email: Type.String(),
  displayName: Type.Union([Type.String(), Type.Null()]),
  photoUrl: Type.Union([Type.String(), Type.Null()]),

  deletedAt: Type.Union([Type.Date(), Type.Null()]),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
})

type User = Static<typeof userSchema>
type UserDrizzle = typeof user.$inferSelect

```

##### `user-legal.ts`
```typescript
/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: user-legal.ts
 * Relative file path: guiho\source\user-legal.ts
 * The relative path is the file path on workspace or folder.
 */

import { bigint, bigserial, date, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { generateId } from '@guiho40/sensacional'

import { Type, type Static } from '@sinclair/typebox'
import { genderEnum, genderEnumSchema } from './drizzle.js'
import { user } from './user.js'

export { userLegal, userLegalSchema }
export type { UserLegal }

/**
 * This table holds sensitive, personally identifiable information (PII)
 * and has a strict one-to-one relationship with the user table.
 */
const userLegal = pgTable(
  'user_legal',
  {
    /** Internal Primary Key (BIGSERIAL) */
    id: bigserial('id', { mode: 'number' }).unique().primaryKey(),

    /** A collision-resistant, URL-safe, and public-facing unique identifier. */
    uid: text('uid')
      .notNull()
      .unique()
      .$defaultFn(() => generateId(24)),

    // Foreign keys to other tables
    userId: bigint('user_id', { mode: 'number' }) // <-- same type as user.id
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Entity-specific fields
    firstName: text('first_name').notNull(),
    middleName: text('middle_name'),
    lastName: text('last_name').notNull(),
    nickname: text('nickname'),
    birthDate: date('birth_date'),
    gender: genderEnum('gender'),

    // Soft-deletion timestamp
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Standard timestamp fields
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    index('user_legal_created_at_idx').on(table.createdAt),
    index('user_legal_updated_at_idx').on(table.updatedAt),
  ],
)

const userLegalSchema = Type.Object({
  id: Type.Number(),
  uid: Type.String(),

  userId: Type.Number(),

  firstName: Type.String(),
  middleName: Type.Union([Type.String(), Type.Null()]),
  lastName: Type.String(),
  nickname: Type.Union([Type.String(), Type.Null()]),
  birthDate: Type.Union([Type.Date(), Type.Null()]),
  gender: genderEnumSchema,

  deletedAt: Type.Union([Type.Date(), Type.Null()]),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
})

type UserLegal = Static<typeof userLegalSchema>

```

##### `user-relations.ts`
```typescript
/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: user-relations.ts
 * Relative file path: guiho\source\user-relations.ts
 * The relative path is the file path on workspace or folder.
 */

import { relations } from 'drizzle-orm'
import { userLegal } from './user-legal.js'
import { user } from './user.js'

export { userRelations }

// Drizzle Relations for the `user` table
const userRelations = relations(user, ({ one }) => ({
  /**
   * A user has a one-to-one relationship with their legal information.
   * This defines the 'legal' property when querying a user with relations.
   */
  legal: one(userLegal, {
    fields: [user.id],
    references: [userLegal.userId],
  }),
}))

```

##### `user-legal-relations.ts`
```typescript
/**
 * @copyright Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO. All Rights Reserved.
 */

/**
 * File name: user-legal-relations.ts
 * Relative file path: guiho\source\user-legal-relations.ts
 * The relative path is the file path on workspace or folder.
 */

import { relations } from 'drizzle-orm'
import { userLegal } from './user-legal.js'
import { user } from './user.js'

export { userLegalRelations }

// Drizzle Relations for the `user_legal` table
const userLegalRelations = relations(userLegal, ({ one }) => ({
  /**
   * A legal record belongs to exactly one user.
   * This defines the 'user' property when querying legal info with relations.
   */
  user: one(user, {
    fields: [userLegal.userId],
    references: [user.id],
  }),
}))

```



## GUIHO PostgreSQL Naming Convention

This document outlines the standard naming convention for all database objects. The primary goals of this convention are clarity, consistency, and predictability, making the database schema easy to understand and maintain.

#### Core Principles

1.  **Identifier Case:** All identifiers (tables, columns, functions, etc.) MUST be written in `snake_case`.

    - **Example:** `product_order`, `first_name`.

2.  **Identifier Separator:** A single underscore (`_`) is used to separate words within an identifier.

    - **Example:** `delivery_address`, not `delivery-address` or `deliveryAddress`.

3.  **Singular Nouns:** All table and entity names MUST be singular. This reflects the entity that each row represents.

    - **Example:** `user`, `order`, `product`.

4.  **Dual Key System:** Every entity table will have two unique identifiers:

    - **`id` (Primary Key):** An internal-facing, auto-incrementing integer (`BIGSERIAL`) used for joins and relational integrity. It should never be exposed to the outside world.
    - **`uid` (Unique Identifier):** An external-facing, immutable, and unique text field. This key is used in APIs, URLs, and for referencing records from external systems.

#### Object Naming Rules

##### 1. Tables (Relations)

Table names follow the core principles: singular and snake_case.

- **Convention:** `entity_name`
- **Examples:**
  - `organization`
  - `app_user`
  - `product_inventory`

##### 2. Columns

Column names also follow the core principles.
Every column should by default be required, unless I tell you to make it optional, so append NOT NULL.

**Standard Columns:**
Every entity table MUST contain the following two columns:

- **`id` (Primary Key):**

  - **Name:** `id`
  - **Type:** `BIGSERIAL`
  - **Role:** Primary Key. Internal use only.

- **`uid` (Unique Identifier):**
  - **Name:** `uid`
  - **Type:** `TEXT`
  - **Role:** Supplementary Unique Key. External use. Must have a `UNIQUE` constraint. It should be populated with a secure, random value like a UUID upon creation.

**Attribute Columns:**

- **Convention:** `attribute_name`
- **Examples:** `name`, `first_name`, `created_at`, `description`.

##### 3. Foreign Keys (FK)

Foreign key columns are named by combining the name of the referenced table with the `_id` suffix. They always reference the `id` column of the target table, not the `uid`.

- **Convention:** `referenced_table_singular_id`
- **Examples:**
  - In the `product_order` table, the foreign key referencing `app_user` is `app_user_id`.
  - In the `address` table, the foreign key referencing `country` is `country_id`.

##### 4. Join Tables (Many-to-Many Relationships)

**Type A: Simple Link Table**

This table purely connects two other tables. It does **not** represent a core entity and therefore **does not require** a `uid` column. Its purpose is purely structural.

- **Convention:** `table_a__table_b` (tables in alphabetical order, separated by a double underscore `__`).
- **Example:**
  - A many-to-many relationship between `organization` and `app_user`.
  - **Table Name:** `organization__app_user`
  - **Columns:** `organization_id`, `app_user_id`.

**Type B: Rich Relationship Table (Associative Entity)**

This table represents a relationship that has its own attributes. It is treated as a standard entity and therefore **MUST** follow the dual key system (`id` and `uid`).

- **Convention:** `entity_name` (singular, snake_case).
- **Example:**
  - A user's assignment to a project, which includes a `role`.
  - **Join Table Name:** `project_assignment`
  - **Columns:** `id` (PK), `uid` (Unique), `app_user_id` (FK), `project_id` (FK), `role`, `assigned_at`.

#### 5. Indexes and Constraints

Explicitly name all constraints for clarity.

- **Primary Key:** `{table_name}_pk`
- **Foreign Key:** `{table_name}_{column_name}_fk`
- **Unique:** `{table_name}_{column_name}_uq`
- **Index:** `{table_name}_{column_names}_idx`
- **Check:** `{table_name}_{column_name}_chk`



## 0046 - Typescript Engineering Best Practices

- Do not destructure objects on key places (loaders, actions, elysia http handler, etc), as they my be referenced during a possible refactor.
  Example:

  - Bad:

  ```typescript
  async function action({ request, context, params }: Route.LoaderArgs) {
    const { uid: processorUid } = params
  }
  ```

  - Bad:

  ```typescript
  async function action({ request, context, params: { uid } }: Route.LoaderArgs) {
    const processorUid = uid // or <something else>Uid, like userUid
  }
  ```

  - Good:

  ```typescript
  async function action({ request, context, params }: Route.LoaderArgs) {
    const processorUid = params.uid // or <something else>Uid, like userUid
  }
  ```

- Use top-level `import type` syntax. Do not use inline `type` imports.

  **Examples:**
  ❌ `import { type Processor } from '@guiho40/razura40'`
  ✅ `import type { Processor } from '@guiho40/razura40'`


