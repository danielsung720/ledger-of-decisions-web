.PHONY: install build up down restart shell npm dev prod logs clean

# Install dependencies (run in container)
install:
	docker compose run --rm web npm install

# Build Docker images
build:
	docker compose build

# Start development containers
up:
	docker compose up -d

# Start with logs
dev:
	docker compose up

# Stop containers
down:
	docker compose down

# Restart containers
restart:
	docker compose restart

# Access shell
shell:
	docker compose exec web sh

# Run npm command (usage: make npm cmd="run build")
npm:
	docker compose exec web npm $(cmd)

# View logs
logs:
	docker compose logs -f web

# Build for production
prod-build:
	docker compose -f docker-compose.prod.yml build

# Start production containers
prod-up:
	docker compose -f docker-compose.prod.yml up -d

# Stop production containers
prod-down:
	docker compose -f docker-compose.prod.yml down

# Clean up
clean:
	docker compose down -v --rmi local
	rm -rf node_modules .nuxt .output

# Type check
typecheck:
	docker compose exec web npm run typecheck

# Lint
lint:
	docker compose exec web npm run lint

# Lint with fix
lint-fix:
	docker compose exec web npm run lint:fix
