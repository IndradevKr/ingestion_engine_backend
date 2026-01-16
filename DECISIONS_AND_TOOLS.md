# Technical Decisions and Tools Documentation

This document explains the "why" behind the technology choices and architectural patterns used in the `ingestion-backend-hackathon` project.

## 1. Architectural Decisions

### 1.1 CQRS (Command Query Responsibility Segregation)
- **Decision:** Use `@nestjs/cqrs` to separate read (queries) and write (commands) operations.
- **Justification:** The document ingestion pipeline involves complex state transitions (uploaded -> processing -> extracting -> parsed). CQRS helps keep the business logic clean by isolating these state-changing actions into dedicated handlers, improving maintainability and testability as the system grows.

### 1.2 Event-Driven Background Processing
- **Decision:** Use **BullMQ** (powered by **Redis**) for asynchronous document processing.
- **Justification:** AI-powered classification and extraction are time-consuming operations (often taking 5-15 seconds). Processing these synchronously would block the API response and lead to a poor user experience. BullMQ provides a robust, persistent queue system that ensures jobs are eventually processed even if the server restarts.

### 1.3 Real-time Status Updates
- **Decision:** Use **Socket.io** (WebSockets) via `@nestjs/websockets`.
- **Justification:** Since processing happens in the background, the frontend needs a way to receive status updates without constant polling. WebSockets provide a low-latency, bi-directional communication channel to push "processing", "extracting", and "parsed" events directly to the UI.

## 2. Tools and Technologies

### 2.1 Framework: NestJS
- **Justification:** NestJS provides a highly structured, enterprise-grade framework for Node.js. Its modularity allows for clear separation of concerns (Contacts vs. Documents vs. Uploads), and its built-in support for decorators and Dependency Injection aligns perfectly with modern TypeScript best practices.

### 2.2 AI: Google Gemini (2.5 Flash & 3 Flash Preview)
- **Justification:** 
    - **Flash Models:** Chosen for their high speed and lower cost while maintaining excellent accuracy for classification tasks.
    - **Schema-Driven Extraction:** We leverage Gemini's structured output capabilities (JSON Mode with `responseSchema`) to ensure the AI output strictly adheres to our `MASTER_EXTRACTION_SCHEMA`, eliminating the need for complex regex or manual post-parsing.

### 2.3 Database: PostgreSQL & TypeORM
- **Justification:** PostgreSQL is a reliable relational database that handles our structured contact and document metadata efficiently. TypeORM simplifies database operations through an Object-Relational Mapping layer, providing type-safety and automated migrations.

### 2.4 Storage: AWS S3
- **Justification:** S3 is the industry standard for scalable, durable object storage. It is used to store the raw binary files (PDFs, Images) before and after processing, keeping the database "light" by only storing file references (S3 paths).

## 3. Development Workflow Tools

- **Docker:** Ensures consistency between development, staging, and production environments by containerizing Redis and PostgreSQL.
- **TypeScript:** Provides static typing, which is crucial for a project involving complex schemas and external API integrations (Gemini, AWS SDK).
- **ESLint & Prettier:** Standardize code style and catch potential errors early in the development cycle.
