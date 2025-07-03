define get_env
$(if $(ENV),$(ENV),dev)
endef

COMPOSE_FILE = ./deployments/$(call get_env)/docker-compose.yaml
ENV_FILE = ./deployments/$(call get_env)/conf/.env.local
COMPOSE = docker compose -f $(COMPOSE_FILE) --env-file=$(ENV_FILE)

.PHONY: help
help:
	@echo "Available commands."
	@echo "To use production environment, use \033[33mENV=prod\033[0m after command (example: make up \033[33mENV=prod\033[0m)."
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


#--------------- BASE COMMANDS ---------------#

.PHONY: build
build: ## Build Docker images
	@$(COMPOSE) build

.PHONY: up
up: ## Start Docker containers
	@$(COMPOSE) up -d

.PHONY: up-logs
up-logs: ## Start Docker containers with logs output
	@$(COMPOSE) up

.PHONY: down
down: ## Stop Docker containers
	@$(COMPOSE) down

.PHONY: clean
clean: ## Clean environment (remove images)
	@$(COMPOSE) down --rmi all

.PHONY: clean-volumes
clean-volumes: ## Clean environment (remove volumes)
	@$(COMPOSE) down -v

.PHONY: restart
restart: ## Restart Docker containers
	@$(COMPOSE) restart

#--------------- BACKEND COMMANDS ---------------#

.PHONY: startapp
startapp: ## Create a new Django app
	@sh -c 'read -p "Enter the django app name: " app_name && \
	echo "Creating Django app: $$app_name" && \
	$(COMPOSE) exec backend sh -c \
	"cd src/apps && poetry run python ../manage.py startapp $$app_name"'

.PHONY: migrate
migrate: ## Apply django migrations
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py migrate"

.PHONY: makemigrations
makemigrations: ## Create django migrations
	@read -p "Enter the django app(apps) name(names) [Enter for All]: " app_name; \
	$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py makemigrations $$app_name"

.PHONY: createsuperuser
createsuperuser: ## Create django superuser
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py createsuperuser"

.PHONY: parse-wb-products
parse-wb-products: ## Parse products from Wildberries. Usage: make parse-wb-products query="" pages=1 limit=100
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py parse_wb_products \
	--query=\"$(or $(query),)\" \
	--pages=$(or $(pages),1) \
	--limit=$(or $(limit),100)"

.PHONY: shell-backend
shell-backend: ## Enter backend shell
	@$(COMPOSE) exec backend sh

#--------------- TESTING COMMANDS ---------------#

.PHONY: run-tests
run-tests: ## Run all Django tests
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py test apps"

.PHONY: run-tests-app
run-tests-app: ## Run tests for specific Django app
	@read -p "Enter the django app name: " app_name; \
	echo "Testing Django app: $$app_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py test apps.$$app_name.tests"

#--------------- DEPENDENCY MANAGEMENT ---------------#

.PHONY: add-back-dep
add-back-dep: ## Add backend dependency
	@read -p "Enter the dependency name: " dep_name; \
	echo "Installing dependency: $$dep_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry add $$dep_name"

.PHONY: add-back-dep-dev
add-back-dep-dev: ## Add backend development dependency
	@read -p "Enter the dependency name for development: " dep_name; \
	echo "Installing dependency: $$dep_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry add $$dep_name --dev"

.PHONY: remove-back-dep
remove-back-dep: ## Remove backend dependency
	@read -p "Enter the dependency name: " dep_name; \
	echo "Removing dependency: $$dep_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry remove $$dep_name"

.PHONY: add-front-dep
add-front-dep: ## Add frontend dependency
	@sh -c 'read -p "Enter the dependency name: " dep_name && \
	echo "Installing dependency: $$dep_name" && \
	$(COMPOSE) exec frontend sh -c \
	"bun add $$dep_name"'

.PHONY: add-front-dep-dev
add-front-dep-dev: ## Add frontend development dependency
	@sh -c 'read -p "Enter the dependency name for development: " dep_name && \
	echo "Installing dependency: $$dep_name" && \
	$(COMPOSE) exec frontend sh -c \
	"bun add -d $$dep_name"'

.PHONY: remove-front-dep
remove-front-dep: ## Remove frontend dependency
	@sh -c 'read -p "Enter the dependency name: " dep_name && \
	echo "Removing dependency: $$dep_name" && \
	$(COMPOSE) exec frontend sh -c \
	"bun remove $$dep_name"'

#--------------- LINT/FORMAT COMMANDS ---------------#

.PHONY: run-back-lint
run-back-lint: ## Run linting for backend code
	@$(COMPOSE) exec backend sh -c \
	"poetry run ruff check --config=ruff.toml"

.PHONY: run-back-format
run-back-format: ## Format backend code
	@$(COMPOSE) exec backend sh -c \
	"poetry run ruff format --config=ruff.toml"

.PHONY: run-front-lint
run-front-lint: ## Run linting for frontend code
	@$(COMPOSE) exec frontend sh -c \
	"bun run lint"

.PHONY: run-front-format
run-front-format: ## Format frontend code
	@$(COMPOSE) exec frontend sh -c \
	"bun run format"
