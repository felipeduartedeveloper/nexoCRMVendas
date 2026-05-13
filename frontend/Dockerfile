FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 5173;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  location /assets/ {
    expires 7d;
    add_header Cache-Control "public, immutable";
  }
  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
