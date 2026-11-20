# Food Store

Trabajo Práctico Integrador de Programación 4 (UTN, Tecnicatura Universitaria en Programación a Distancia).
Aplicación web de pedidos de comida: backend FastAPI + SQLModel + PostgreSQL y frontend React + TypeScript.

- **Alumno:** Gastaldello, Kevin Andrés
- **Repositorio:** https://github.com/kvin21ok/food-store-tpi
- **Video de demostración:** <link público del video>

## Requisitos

- Python 3.11 a 3.13 (no funciona con 3.14)
- PostgreSQL 15 o superior
- Node.js 20.19 o superior
- pnpm 9 o superior
- Git

## Estructura

- `backend/`: API REST (FastAPI, SQLModel, Unit of Work).
- `frontend/`: aplicación web (React, Vite, Tailwind, TanStack Query, Form y Table, Zustand).

## Backend

1. Crear una base de datos vacía en PostgreSQL:

```sql
CREATE DATABASE foodstore_db;
```

2. Desde la carpeta `backend`, crear el entorno virtual, instalar las dependencias y copiar el archivo de variables.

Windows (PowerShell):

```
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Linux / macOS:

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

3. Editar `.env` con los datos reales (ver la tabla de variables). La `SECRET_KEY` se puede generar con:

```
python -c "import secrets; print(secrets.token_hex(32))"
```

4. Cargar los datos iniciales (administrador, categorías y productos). Es idempotente: se puede ejecutar más de una vez sin duplicar nada.

```
python -m app.db.seed
```

5. Iniciar el servidor:

```
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1` y la documentación en `http://localhost:8000/docs` y `http://localhost:8000/redoc`.

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:TU_PASSWORD@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

Si la contraseña de PostgreSQL tiene caracteres especiales (`@`, `:`, `/`, `#`, `%`), hay que codificarlos en la URL (por ejemplo `@` se escribe `%40`).

## Frontend

Desde la carpeta `frontend`:

Windows (PowerShell):

```
cd frontend
pnpm install
copy .env.example .env
pnpm build
pnpm dev
```

Linux / macOS:

```
cd frontend
pnpm install
cp .env.example .env
pnpm build
pnpm dev
```

La aplicación queda en `http://localhost:5173`. `pnpm build` verifica los tipos de TypeScript.

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuario administrador del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

El seed también carga 3 categorías y 9 productos con stock. Los usuarios que se registran desde la aplicación tienen rol `user` (cliente).

## Notas de uso

- Abrir la aplicación con `http://localhost:5173` (no con `127.0.0.1`): la sesión viaja en una cookie HttpOnly y el navegador solo la envía si el frontend y el backend comparten host.
- El puerto del frontend es fijo (5173) porque tiene que coincidir con `FRONTEND_ORIGIN`. Si está ocupado, Vite no arranca.
- La sesión dura 30 minutos. El token nunca se guarda en el navegador: solo viaja en la cookie.

## Reglas de negocio

- **Crear pedido:** una sola transacción; valida producto activo, disponible y con stock, descuenta el stock y copia nombre y precio en cada línea.
- **Estados:** PENDIENTE → EN_PREPARACION → ENTREGADO; se puede pasar a CANCELADO desde PENDIENTE o EN_PREPARACION. ENTREGADO y CANCELADO son terminales.
- **Cancelar:** restituye el stock en la misma transacción.
- **Permisos:** el cliente solo ve y cancela sus pedidos (solo en PENDIENTE); el administrador ve todos y gestiona los estados.
- **Inmutabilidad:** las líneas y el total de un pedido no cambian después de creado.