# 🏗️ Arquitectura del Sistema - Jeopardy Trivia

## 📋 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        JEOPARDY TRIVIA                          │
│                      Tech Edition v1.0                         │
│                    Arquitectura del Sistema                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HOST PANEL    │    │  PLAYER PANEL   │    │   GAME BOARD    │
│                 │    │                 │    │                 │
│ • Game Control  │    │ • Registration  │    │ • Questions     │
│ • Player List   │    │ • Answer Input  │    │ • Options       │
│ • Question Mgmt │    │ • Results       │    │ • Timer           │
│ • Leaderboard   │    │ • Score Display │    │ • Animations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE APLICACIÓN                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   WEBSOCKETS    │    │   STATE MGMT    │
│                 │    │                 │    │                 │
│ • Next.js 14    │    │ • Real-time     │    │ • Game State    │
│ • React 18      │    │ • Broadcasting  │    │ • User State    │
│ • TypeScript    │    │ • Event Sync    │    │ • Question State│
│ • Tailwind CSS  │    │ • Reconnection  │    │ • Score State   │
│ • Framer Motion │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE SERVICIOS                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    BACKEND      │    │   API LAYER     │    │   BUSINESS      │
│                 │    │                 │    │   LOGIC         │
│ • FastAPI       │    │ • REST Endpoints│    │ • Game Rules    │
│ • Python 3.11   │    │ • WebSocket     │    │ • Score Logic   │
│ • Uvicorn       │    │ • Validation    │    │ • Timer Logic   │
│ • Pydantic      │    │ • Error Handling│    │ • State Logic   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE DATOS                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DATABASE      │    │   PERSISTENCE   │    │   CACHE         │
│                 │    │                 │    │                 │
│ • SQLite        │    │ • User Data     │    │ • Game State    │
│ • SQLAlchemy    │    │ • Questions     │    │ • Session Data  │
│ • ORM           │    │ • Answers       │    │ • Temp Data     │
│ • Migrations    │    │ • Scores        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Flujo de Datos

### **1. Registro de Usuario**
```
Usuario → Frontend → API /register → Database → WebSocket → Todos los clientes
```

### **2. Inicio de Juego**
```
Host → Frontend → API /start-game → Database → WebSocket → Countdown → Primera pregunta
```

### **3. Pregunta Activa**
```
Sistema → WebSocket → Todos los clientes → Timer (15s) → Respuestas → Validación → Puntuación
```

### **4. Siguiente Pregunta**
```
Host → Frontend → API /next-question → Database → WebSocket → Nueva pregunta → Reset timer
```

## 🏗️ Componentes del Sistema

### **Frontend (Next.js)**
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PAGE.TSX      │    │   LAYOUT.TSX    │    │   COMPONENTS    │
│                 │    │                 │    │                 │
│ • Role Selection│    │ • Global Styles │    │ • HostPanel     │
│ • URL Detection │    │ • Particles     │    │ • PlayerPanel   │
│ • Routing       │    │ • Fonts         │    │ • GameBoard     │
│                 │    │ • Metadata      │    │ • Leaderboard   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   STATE MGMT    │    │   WEBSOCKET     │    │   ANIMATIONS    │
│                 │    │   CONNECTION    │    │                 │
│ • Game State    │    │ • Auto Connect  │    │ • Framer Motion  │
│ • User State    │    │ • Event Handler │    │ • Transitions    │
│ • Question State│    │ • Reconnection  │    │ • Effects        │
│ • Timer State   │    │ • Error Handling│    │ • Particles      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Backend (FastAPI)**
```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MAIN.PY       │    │   MODELS       │    │   ENDPOINTS     │
│                 │    │                 │    │                 │
│ • FastAPI App   │    │ • User Model    │    │ • /register     │
│ • WebSocket     │    │ • Question Model│    │ • /start-game    │
│ • CORS          │    │ • Answer Model  │    │ • /next-question│
│ • Middleware    │    │ • Pydantic      │    │ • /submit-answer│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DATABASE      │    │   WEBSOCKET     │    │   GAME LOGIC    │
│   OPERATIONS    │    │   MANAGER       │    │                 │
│                 │    │                 │    │                 │
│ • CRUD Ops      │    │ • Connections   │    │ • Game State    │
│ • Transactions  │    │ • Broadcasting  │    │ • Score Logic   │
│ • Queries       │    │ • Event Handling│    │ • Timer Logic   │
│ • Migrations    │    │ • Error Handling│    │ • Question Logic│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Modelo de Datos

### **Entidades Principales**
```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      USERS      │    │    QUESTIONS    │    │  USER_ANSWERS   │
│                 │    │                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
│ • name          │    │ • question_text │    │ • user_id (FK)  │
│ • score         │    │ • option_a      │    │ • question_id   │
│ • is_host       │    │ • option_b      │    │ • selected_ans  │
│ • created_at    │    │ • option_c      │    │ • is_correct    │
│                 │    │ • option_d      │    │ • answered_at   │
│                 │    │ • correct_answer│    │                 │
│                 │    │ • is_active     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────┐
                    │   GAME STATE    │
                    │                 │
                    │ • is_registration_open │
                    │ • is_game_started      │
                    │ • is_question_active    │
                    │ • current_question      │
                    │ • time_remaining        │
                    │ • question_timer         │
                    └─────────────────┘
```

## 🔄 Patrones de Comunicación

### **WebSocket Events**
```typescript
// Eventos del Sistema
interface WebSocketEvents {
  // Registro
  'registration_started': { message: string }
  'host_confirmed': { message: string }
  
  // Juego
  'game_started': { message: string, countdown: number }
  'new_question': { question: Question, timer: number }
  'game_finished': { leaderboard: User[] }
  
  // Estado
  'game_state': { state: GameState }
}
```

### **API Endpoints**
```typescript
// REST API Structure
interface APIEndpoints {
  // Usuario
  'POST /register': { name: string, is_host: boolean } → User
  'GET /users': void → User[]
  
  // Juego
  'POST /start-registration': void → { message: string }
  'POST /start-game': void → { message: string }
  'POST /start-first-question': void → { message: string }
  'POST /next-question': void → { message: string }
  'POST /submit-answer': { user_id: number, question_id: number, selected_answer: string } → { correct: boolean, score: number }
}
```

## 🚀 Despliegue y Escalabilidad

### **Docker Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER DEPLOYMENT                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   CONTAINER     │    │   CONTAINER     │    │   VOLUME        │
│                 │    │                 │    │                 │
│ • Next.js App   │    │ • FastAPI App   │    │ • SQLite File   │
│ • Port 3000     │    │ • Port 8000     │    │ • Persistent    │
│ • Static Assets │    │ • WebSocket     │    │ • Shared        │
│ • Build Optimized│    │ • Health Checks│    │ • Backup Ready  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NGINX         │    │   DOCKER        │    │   MONITORING    │
│   PROXY         │    │   COMPOSE       │    │                 │
│                 │    │                 │    │                 │
│ • Load Balance  │    │ • Orchestration │    │ • Health Checks │
│ • SSL/TLS       │    │ • Networking    │    │ • Logs           │
│ • Static Files  │    │ • Volumes       │    │ • Metrics       │
│ • WebSocket     │    │ • Environment   │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Kubernetes Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                      KUBERNETES DEPLOYMENT                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   INGRESS       │    │   SERVICES       │    │   DEPLOYMENTS   │
│                 │    │                 │    │                 │
│ • Nginx Controller│    │ • Frontend SVC  │    │ • Frontend (2)  │
│ • SSL/TLS       │    │ • Backend SVC    │    │ • Backend (2)   │
│ • Load Balance  │    │ • ClusterIP      │    │ • Auto Scaling  │
│ • WebSocket     │    │ • Health Checks  │    │ • Rolling Update│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CONFIGMAPS    │    │   PVC           │    │   MONITORING    │
│                 │    │                 │    │                 │
│ • App Config    │    │ • Database Data   │    │ • Prometheus    │
│ • Questions     │    │ • Persistent    │    │ • Grafana       │
│ • Environment   │    │ • Backup Ready  │    │ • Logs          │
│ • Secrets       │    │ • Shared        │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Seguridad y Rendimiento

### **Medidas de Seguridad**
- **Validación de datos** con Pydantic
- **Sanitización** de inputs del usuario
- **Rate limiting** en endpoints críticos
- **CORS** configurado correctamente
- **WebSocket** con autenticación implícita

### **Optimizaciones de Rendimiento**
- **Conexiones WebSocket** persistentes
- **Broadcasting** eficiente a múltiples clientes
- **Caching** de estado del juego
- **Compresión** de assets estáticos
- **Lazy loading** de componentes

### **Monitoreo y Observabilidad**
- **Health checks** en todos los servicios
- **Logs estructurados** para debugging
- **Métricas** de rendimiento
- **Alertas** automáticas
- **Tracing** de requests

## 📈 Escalabilidad

### **Escalado Horizontal**
- **Múltiples réplicas** de frontend y backend
- **Load balancing** automático
- **Session affinity** para WebSockets
- **Database sharding** (futuro)

### **Escalado Vertical**
- **Resource limits** configurados
- **Auto-scaling** basado en CPU/memoria
- **Graceful shutdown** de pods
- **Rolling updates** sin downtime

---

**Esta arquitectura está diseñada para ser escalable, mantenible y robusta, proporcionando una excelente experiencia de usuario mientras mantiene la simplicidad de desarrollo y despliegue.**
