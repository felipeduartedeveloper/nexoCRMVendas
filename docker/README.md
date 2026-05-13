# docker/

Arquivos de orquestração do `crmvendas`.

## Conteúdo

- `postgres/init.sql` — extensões (uuid-ossp, pgcrypto) + timezone São Paulo. Rodado uma vez na primeira subida do volume.
- `nginx/nginx.conf` — reverse proxy unificado:
  - `localhost:8081` → frontend (com proxy de `/api`, `/uploads`, `/ws`, `/docs`)
  - `admin.localhost:8081` → admin
  - `api.localhost:8081` → backend direto

## Comandos úteis

```bash
# subir
docker compose up -d --build

# logs
docker compose logs -f backend

# rebuild de um serviço
docker compose up -d --build backend

# zerar tudo (apaga dados)
docker compose down -v
```
