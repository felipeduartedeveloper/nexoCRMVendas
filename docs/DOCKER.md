# Docker

`docker-compose.yml` na raiz define 7 serviços com nome do projeto
`crmvendas` e rede `crmvendas_net`.

## Serviços

| Serviço   | Imagem / Build                | Porta host | Healthcheck                            |
| --------- | ----------------------------- | ---------- | -------------------------------------- |
| postgres  | `postgres:16-alpine`          | 5432       | `pg_isready -U $POSTGRES_USER`         |
| redis     | `redis:7-alpine`              | 6379       | `redis-cli ping`                       |
| minio     | `minio/minio:latest`          | 9000/9001  | `curl -f http://localhost:9000/minio/health/live` |
| backend   | `./backend` (Dockerfile)      | 3000       | `curl -f http://localhost:3000/health` |
| frontend  | `./frontend` (Dockerfile)     | 5173       | —                                      |
| admin     | `./admin` (Dockerfile)        | 5174       | —                                      |
| nginx     | `nginx:1.27-alpine`           | 80         | proxy reverso                          |

## Volumes

- `crmvendas_postgres` → `/var/lib/postgresql/data`
- `crmvendas_redis` → `/data`
- `crmvendas_minio` → `/data`

## Ordem de subida

`nginx` depende de `frontend`, `admin`, `backend`.
`backend` depende de `postgres` (healthy) + `redis` (healthy) + `minio` (started).

## Comandos úteis

```bash
docker compose up -d                       # sobe tudo em background
docker compose logs -f backend             # acompanha logs do backend
docker compose exec postgres psql -U crmvendas -d crmvendas  # psql
docker compose exec redis redis-cli        # CLI do redis
docker compose down                        # para todos
docker compose down -v                     # para + apaga volumes (perde dados!)
```

## MinIO bootstrap

Na primeira subida, o backend tenta criar o bucket `crmvendas-media`
(configurável via `S3_BUCKET`). Console: `http://localhost:9001`
(login: `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`).

## Nginx routing

```
/                 → frontend:5173
/admin            → admin:5174       (com rewrite removendo /admin prefix)
/api/             → backend:3000
/docs             → backend:3000     (Swagger)
/socket.io/       → backend:3000     (websocket upgrade)
```

Veja `docker/nginx/nginx.conf` para detalhes.
