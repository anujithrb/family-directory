.PHONY: dev build up down logs migrate seed test clean shell-backend shell-db pwa-assets

# Development
dev:
	docker compose up --build -d
	@echo "Services starting..."
	@echo "Backend:  http://localhost:3000"
	@echo "Frontend: http://localhost:4200"
	@echo "API Docs: http://localhost:3000/api/docs"

# Build production images
build:
	docker build -t family-directory-backend:latest ./backend
	docker build -t family-directory-frontend:latest ./frontend

# Start production stack
up:
	docker compose -f docker-compose.prod.yml up -d

# Stop all services
down:
	-docker compose down
	-docker compose -f docker-compose.prod.yml down

# Tail logs
logs:
	docker compose logs -f

# Run DB migrations
migrate:
	docker compose exec backend npx prisma migrate deploy

# Seed database
seed:
	docker compose exec backend npm run prisma:seed

# Run tests
test:
	docker compose exec backend npm test

# Clean all volumes and images
clean:
	-docker compose down -v
	-docker compose -f docker-compose.prod.yml down -v
	-docker rmi family-directory-backend:latest family-directory-frontend:latest

# Open shell in backend container
shell-backend:
	docker compose exec backend sh

# Open psql shell
shell-db:
	docker compose exec postgres psql -U $$POSTGRES_USER $$POSTGRES_DB

# Generate PWA assets
pwa-assets:
	cd frontend && npx pwa-asset-generator assets/icons/source-icon.svg assets/icons \
		--index src/index.html --manifest src/manifest.webmanifest
