API extremamente simples de CRUD de tarefas usando:

- **Node.js + TypeScript**
- **Hono**
- **AWS Lambda**
- **Amazon API Gateway (HTTP API)**
- **Amazon DynamoDB**

### Estrutura básica

- `src/index.ts`: handler principal da Lambda com rotas:
  - `POST /tasks` – cria tarefa
  - `GET /tasks/{id}` – lê tarefa por ID
  - `PUT /tasks/{id}` – atualiza tarefa por ID
  - `DELETE /tasks/{id}` – remove tarefa por ID
  - `GET /tasks?date=YYYY-MM-DD` – lista tarefas (todas ou filtradas por data)

### Scripts principais

- `npm run build` – compila ts para `dist/`


