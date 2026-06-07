# Build phase
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV VITE_API_BASE_URL=/api
ENV VITE_GATEWAY_BASE_URL=/v1

RUN npm run build

# Nginx runner phase
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
