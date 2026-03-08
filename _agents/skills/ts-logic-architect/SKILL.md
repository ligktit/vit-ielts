---
name: ts-logic-architect
description: Specialized skillset for porting legacy business logic (PHP/Functions) to high-performance TypeScript service layers and scoring algorithms.
---

# TypeScript Business Logic Architect

High-level architectural guide for transforming PHP-based business logic into efficient TypeScript services.

## Core Capabilities
1. **PHP-to-TypeScript Logic Porting**: Translating complex WordPress `functions.php` snippets into high-performance TypeScript services.
2. **Scoring Engine Implementation**: Managing complex calculation logic (Reading/Listening) with type-safe implementations.
3. **Service Layer Pattern**: Decoupling business logic from API routes and pages into a dedicated `services/` directory.
4. **Data Validation**: Using Type-safe guards for JSONB data inputs.
5. **State Synchronization**: Maintaining consistent server/client state for real-time exam processes.

## Guidelines
- **Logic Mapping**: Always document the origin PHP function and its new TypeScript location.
- **Type Definitions**: Define unique types for every business entity in `types/` (e.g., `Quiz`, `TestResult`, `ScoringResult`).
- **Error Handling**: Implement structured try-catch blocks in service functions to provide clear error messages.
- **Async Efficiency**: Use `Promise.all()` for concurrent data fetching (e.g., retrieving Site Settings + Menu + Viewer).

## Checklist for Porting Logic
1. Identify PHP core function (Origin location).
2. Trace all dependencies and internal WordPress calls.
3. Create TypeScript interface for inputs and outputs.
4. Write the logic using modern TS/JS array methods (`map`, `filter`, `reduce`).
5. Add unit test coverage or verification logs.
6. Verify against existing WordPress output.
