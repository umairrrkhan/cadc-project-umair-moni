# AI-Powered Multimodal Math Problem Solver

Ask UmNi  , A cloud-native, microservice-based platform that solves mathematical problems through two distinct interaction modes — text-based conversational chat and a vision-powered drawing interface. The system integrates multiple AI models, supports real-time message processing, and provides persistent history with LaTeX-rendered mathematical output.

---

## Architecture Overview

The platform follows a microservice architecture with four independently deployable services, an API gateway, and a service registry.

```
                         ┌─────────────────┐
                         │   React 18 SPA  │
                         │   (Port 3000)   │
                         └────────┬────────┘
                                  │ HTTP / REST
                                  ▼
                         ┌─────────────────┐
                         │ Spring Cloud    │
                         │ Gateway         │
                         │ (Port 8080)     │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌────────────┐ ┌──────────┐ ┌──────────┐
            │ Core       │ │ Note     │ │ Service  │
            │ Service    │ │ Service  │ │ Registry │
            │ (Port 8082)│ │ (Port    │ │ (Port    │
            │            │ │ 8083)    │ │ 8761)    │
            └──────┬─────┘ └────┬─────┘ └──────────┘
                   │            │
         ┌─────────┼──────┐    │
         ▼         ▼      ▼    ▼
     MongoDB   DeepSeek  AWS  MySQL
     Atlas      API      S3   (Railway)
```

### Service Breakdown

| Service | Port | Responsibility |
|---------|------|----------------|
| API Gateway | 8080 | Route requests, CORS, circuit breaker fallbacks |
| Core Service | 8082 | Auth, chat, vision — all AI operations |
| Note Service | 8083 | File upload/download via S3, MySQL persistence |
| Service Registry (Eureka) | 8761 | Service discovery and health monitoring |

---

## Core Features

### 1. Conversational Chat Mode
- Users type math problems in natural language
- DeepSeek AI processes queries with a specialized math system prompt
- Responses include step-by-step LaTeX-formatted mathematical notation
- Full chat history with session management (CRUD)
- Auto-generated session titles from first user message

### 2. Vision Mode
- Interactive HTML5 Canvas drawing board with color picker and brush size controls
- Image upload support (drag-and-drop or file picker) to overlay reference images
- AI analyzes canvas drawings using OpenAI GPT-image-1-mini via image editing endpoint
- Generates solved images stored in AWS S3
- Persistent vision library with gallery view and delete capability

### 3. LaTeX Rendering
- All mathematical expressions rendered client-side using KaTeX
- Supports display math (`$$...$$`) for standalone equations
- Supports inline math (`$...$`) for equations within text
- Markdown formatting including code blocks with syntax labels

### 4. Smart Session Management
- Sessions created only when user sends first message (no phantom sessions)
- Session titles auto-generated from first user message content
- Sidebar groups sessions by Today, Yesterday, Last 7 Days, Older
- Session deletion with cascading message cleanup

---

## Data Flow

### Text Chat Flow
```
User types message → POST to Gateway → Core Service
  → Save user message to MongoDB
  → Update session timestamp
  → Build conversation history with system prompt
  → Call DeepSeek API /v1/chat/completions
  → Save AI response to MongoDB
  → Return { reply: "..." } to frontend
  → Frontend renders markdown + LaTeX via KaTeX
```

### Vision Solve Flow
```
User draws on canvas → clicks "Solve This Image"
  → Canvas exported as base64 PNG
  → POST to Gateway → Core Service
  → Strip data URL prefix
  → Decode base64 to binary
  → Upload original image to S3
  → Build multipart form data request
  → POST to OpenAI /v1/images/edits
  → Receive solved image as base64 (b64_json)
  → Upload solved image to S3
  → Save Vision record to MongoDB
  → Return { success, imageurl } to frontend
  → Display generated image in output panel
```

### Polling Fallback
If the `sendMessage` endpoint times out (AI takes too long):
1. Frontend keeps typing indicator visible
2. Polls `GET /messages/{chatId}` every 3 seconds
3. When AI response appears in database, updates UI automatically
4. No error message shown — seamless background recovery

---

## Technology Stack

### Languages
| Language | Version | Usage |
|----------|---------|-------|
| Java | 17 | Backend microservices |
| JavaScript (ES6+) | — | Frontend React application |
| SQL | — | Database queries (MySQL) |
| HTML5 / CSS3 | — | User interface |

### Backend Frameworks & Libraries

#### Spring Ecosystem
| Library | Purpose |
|---------|---------|
| Spring Boot 3 (Web, WebFlux) | REST APIs, reactive HTTP clients |
| Spring Cloud Gateway | API routing, load balancing |
| Spring Cloud Netflix Eureka | Service discovery |
| Spring Cloud Circuit Breaker (Resilience4j) | Fault tolerance, fallback handling |
| Spring Security 6 | Authentication & authorization |
| Spring Data MongoDB | MongoDB repository support |
| Spring Data JPA / Hibernate | MySQL ORM (Note Service) |
| Spring WebClient | Reactive HTTP calls (AI APIs) |

#### Security
| Library | Purpose |
|---------|---------|
| JJWT 0.12.5 (API, Impl, Jackson) | JWT token generation and parsing |
| BCrypt | Password hashing |

#### Database Drivers
| Library | Purpose |
|---------|---------|
| MongoDB Driver | MongoDB connectivity |
| MySQL Connector J | MySQL database connectivity |

#### Cloud & Storage
| Library | Purpose |
|---------|---------|
| AWS SDK S3 v2 | Amazon S3 file storage |

#### AI / ML Integration
| Provider | Endpoint | Model | Purpose |
|----------|----------|-------|---------|
| DeepSeek | /v1/chat/completions | deepseek-v4-flash | Conversational math reasoning |
| OpenAI | /v1/images/edits | gpt-image-1-mini | Vision-based problem solving (image generation from canvas drawings) |

### Frontend Libraries

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| React Router 7 | Client-side routing |
| Axios | HTTP requests with interceptor-based auth |
| KaTeX | LaTeX mathematical expression rendering |
| Framer Motion | Animation library |
| HTML5 Canvas API | Drawing board for vision mode |

### Databases

| Database | Hosting | Usage |
|----------|---------|-------|
| MongoDB Atlas | Cloud | Chat sessions, messages, vision records |
| MySQL | Cloud (Railway) | Note service file metadata |

### Cloud Infrastructure

| Service | Usage |
|---------|-------|
| AWS S3 | Image storage for vision solutions and file notes |
| MongoDB Atlas | Managed MongoDB cluster |
| Railway | Managed MySQL database |

### Tools & Build

| Tool | Purpose |
|------|---------|
| Maven | Java build and dependency management |
| Git | Version control |
| Create React App | React project scaffolding |
| npm | JavaScript package management |

---

## API Endpoints

### Core Service (`/api`)

#### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/signup | Create account (email + password) |
| POST | /auth/login | Authenticate, returns JWT |

#### Chat
| Method | Path | Description |
|--------|------|-------------|
| POST | /chat/session/new | Create new chat session |
| GET | /chat/session | List user's sessions |
| GET | /chat/session/{id}/messages | Get session messages |
| POST | /chat/session/{id}/message | Send message, get AI reply |
| DELETE | /chat/session/{id} | Delete session + messages |

#### Vision
| Method | Path | Description |
|--------|------|-------------|
| POST | /vision/solve | Submit canvas image for AI solving |
| GET | /vision/library | List user's solved images |
| DELETE | /vision/{id} | Delete vision record + S3 image |

### Note Service (`/api/notes`)
| Method | Path | Description |
|--------|------|-------------|
| POST | /notes/upload | Upload file to S3 + save metadata |
| GET | /notes/list | List user's notes |
| DELETE | /notes/{id} | Delete note + S3 file |

---

## Security

- **JWT-based stateless authentication**: Tokens generated at login/signup with HMAC-SHA256 signing
- Token payload includes email (subject) and userId (custom claim)
- 24-hour token expiration
- JWT filter extracts Bearer token, validates, and sets SecurityContext
- Authentication context propagated across all microservices via token header
- CORS configured at gateway level (explicit origin whitelist)
- Passwords hashed with BCrypt

---

## Resilience & Fault Tolerance

- **Circuit Breaker**: Resilience4j configured on all gateway routes
  - Sliding window: 10 requests
  - Failure threshold: 50%
  - Fallback controllers return 503 with descriptive messages
- **Frontend Polling Fallback**: If AI response times out, frontend polls message history every 3 seconds until response appears in database
- **Async Request Timeout**: Spring MVC async timeout set to 120 seconds for long-running AI operations

---

## Running the Platform

### Prerequisites
- Java 17
- Node.js 18+
- Maven
- MongoDB Atlas connection string
- MySQL database URL
- AWS S3 bucket with credentials
- DeepSeek API key
- OpenAI API key

### Service Startup Order
```
1. Service Registry (port 8761)
2. Core Service (port 8082)
3. Note Service (port 8083)
4. API Gateway (port 8080)
5. Frontend (port 3000)
```

### Environment Variables
```
MONGODB_URI, JWT_SECRET, DEEPSEEK_API_KEY, OPENAI_API_KEY,
AWS_ACCESS_KEY, AWS_SECRET_KEY
```
