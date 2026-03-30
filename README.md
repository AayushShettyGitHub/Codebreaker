# Codebreaker

Codebreaker is a high-performance, distributed competitive programming platform designed for real-time multiplayer coding competitions. The system leverages a microservices architecture to provide isolated code execution, asynchronous task processing, and real-time state synchronization.

## Architecture Overview

The system is composed of several specialized services orchestrated via Docker:

1.  **Nginx Reverse Proxy**: Acts as the single entry point. It serves the React frontend as static content and routes API/WebSocket traffic to the backend services.
2.  **Frontend (React)**: A modern SPA built with Vite, providing a dashboard for room management, a real-time leaderboard, and a Monaco-based code editor with multi-language support.
3.  **Backend (Spring Boot)**: The core orchestrator handling room logic, scoring, leaderboards, and user authentication.
4.  **Code Executor**: A dedicated worker service responsible for compiling and executing user-submitted code in isolated environments (Java, Python, C++, Node.js).
5.  **RabbitMQ**: Facilitates asynchronous communication between the Backend and Code Executor using an RPC-style messaging pattern.
6.  **Redis**: Provides high-speed persistence for real-time leaderboards (ZSet) and submission rate limiting.
7.  **PostgreSQL**: The relational database used for persistent storage of players, problems, and historical submissions.

## Key Features

- **Real-time Multiplayer Rooms**: Create or join rooms with unique codes for synchronized competition.
- **Multi-Language Support**: Execute solutions in Python 3, Java 17, C++ 20, and Node.js.
- **Asynchronous Execution**: High-speed code execution using RabbitMQ to prevent blocking the user interface.
- **Dynamic Leaderboards**: Real-time scoring and ranking using Redis-backed sorting algorithms.
- **Achievement System**: Badge awarding logic based on performance metrics (e.g., first blood, solving within time limits).
- **Scalable Architecture**: Support for horizontal scaling of executor workers to handle heavy submission loads.

## Prerequisites

- Docker Desktop or Docker Engine (v20.10+)
- Docker Compose (v2.0+)

## Deployment Instructions

### 1. Environment Configuration
Create a `.env` file in the root directory and populate it with the required environment variables (see `.env` for defaults).

### 2. Start the Stack
Run the following command to build and launch all services:
```bash
docker compose up -d --build
```

### 3. Scaling the Executors
To handle a large number of concurrent submissions, you can scale the code-executor workers:
```bash
docker compose up -d --scale code-executor=3
```

### 4. Access the Platform
Once the startup is complete, the application is available at:
`http://localhost:5173` (Nginx handles proxying to the backend at `/api`).

## Service Communication

### Submission Workflow
1.  **Submission**: User submits code via the Frontend.
2.  **Routing**: Nginx routes the POST request to the Backend.
3.  **Queuing**: Backend puts the execution request into the `code-execution-queue` in RabbitMQ.
4.  **Processing**: One of the available Code Executor instances pulls the task, compiles, and runs the code using the local filesystem (backed by high-performance container storage).
5.  **Response**: The result is returned via RabbitMQ to the Backend.
6.  **Broadcast**: Backend saves the result to PostgreSQL, updates the Redis leaderboard, and broadcasts the status to all room participants via WebSockets.

## Security Design

- **Execution Isolation**: Code execution happens in a dedicated worker container restricted by Docker resource limits (CPU/Memory).
- **Rate Limiting**: Redis-based throttling prevents API abuse and submission flooding.
- **Reverse Proxy**: Nginx hides internal service ports (8080, 5672, 5432) from the public internet.

## Contribution and Maintenance

- **Adding Languages**: New languages can be added by updating the `CodeExecutor.java` service and adding the respective binary to the code-executor Dockerfile.
- **Logging**: Service logs can be monitored using `docker compose logs -f <service-name>`.
