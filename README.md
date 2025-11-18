# DCP Inventory API

API para gestionar inventario de Fosfato Dicálcico (DCP) — products y inventoryMovements.

Run locally:
1. Copy .env.example to .env and adjust MONGODB_URI.
2. npm install
3. npm run gen-swagger   # genera swagger/swagger.json
4. npm run dev

Swagger UI:
http://localhost:8080/api-docs

Deploy in Render:
- Add environment variables (MONGODB_URI, PORT, RATE_LIMIT_WINDOW_MINUTES, RATE_LIMIT_MAX)
- Build command: npm install && npm run gen-swagger
- Start command: npm start
