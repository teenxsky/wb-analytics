ENV ?= ""

ifeq ($(ENV), prod)
    COMPOSE_FILE = ./deployments/prod/docker-compose.yaml
    ENV_FILE = ./deployments/prod/conf/.env.local
else
    COMPOSE_FILE = ./deployments/dev/docker-compose.yaml
    ENV_FILE = ./deployments/dev/conf/.env.local
endif

COMPOSE = docker compose -f $(COMPOSE_FILE) --env-file=$(ENV_FILE)

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

#--------------- BASE COMMANDS ---------------#

.PHONY: select-env
select-env: ## Select environment (dev/prod)
	@if [ "$(ENV)" = "dev" ] || [ "$(ENV)" = "prod" ]; then \
		echo "Using environment: $(ENV)"; \
	else \
		read -p "Enter environment [dev/prod] (default: dev): " env; \
		export ENV=$${env:-dev}; \
		echo "Selected environment: $$ENV"; \
	fi

.PHONY: build
build: select-env ## Build Docker images
	@$(COMPOSE) build

.PHONY: up
up: select-env ## Start Docker containers
	@$(COMPOSE) up -d

.PHONY: up-logs
up-logs: select-env ## Start Docker containers with logs output
	@$(COMPOSE) up

.PHONY: down
down: select-env ## Stop Docker containers
	@$(COMPOSE) down

.PHONY: clean
clean: select-env ## Clean environment (remove images)
	@$(COMPOSE) down --rmi all

.PHONY: clean-volumes
clean-volumes: select-env ## Clean environment (remove volumes)
	@$(COMPOSE) down -v

.PHONY: restart
restart: select-env ## Restart Docker containers
	@$(COMPOSE) restart

#--------------- BACKEND COMMANDS ---------------#

.PHONY: migrate
migrate: select-env ## Apply django migrations
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py migrate"

.PHONY: makemigrations
makemigrations: select-env ## Create django migrations
	@read -p "Enter the django app(apps) name(names) [Enter for All]: " app_name; \
	$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py makemigrations $$app_name"

.PHONY: createsuperuser
createsuperuser: select-env ## Create django superuser
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py createsuperuser"

.PHONY: parse-wb-products
parse-wb-products: select-env ## Parse products from Wildberries
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py parse_wb_products"

.PHONY: shell-backend
shell-backend: select-env ## Enter backend shell
	@$(COMPOSE) exec backend sh

#--------------- TESTING COMMANDS ---------------#

.PHONY: run-tests
run-tests: select-env ## Run all Django tests
	@$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py test apps"

.PHONY: run-tests-app
run-tests-app: select-env ## Run tests for specific Django app
	@read -p "Enter the django app name: " app_name; \
	echo "Testing Django app: $$app_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry run python manage.py test apps.$$app_name.tests"

#--------------- DEPENDENCY MANAGEMENT ---------------#

.PHONY: add-back-dep
add-back-dep: select-env ## Add backend dependency
	@read -p "Enter the dependency name: " dep_name; \
	echo "Installing dependency: $$dep_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry add $$dep_name"

.PHONY: add-back-dep-dev
add-back-dep-dev: select-env ## Add backend development dependency
	@read -p "Enter the dependency name for development: " dep_name; \
	echo "Installing dependency: $$dep_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry add $$dep_name --dev"

.PHONY: remove-back-dep
remove-back-dep: select-env ## Remove backend dependency
	@read -p "Enter the dependency name: " dep_name; \
	echo "Removing dependency: $$dep_name"; \
	$(COMPOSE) exec backend sh -c "cd src && poetry remove $$dep_name"
	
.PHONY: add-front-dep
add-front-dep: select-env ## Add frontend dependency
	@sh -c 'read -p "Enter the dependency name: " dep_name && \
	echo "Installing dependency: $$dep_name" && \
	$(COMPOSE) exec frontend sh -c \
	"bun add $$dep_name"'

.PHONY: add-front-dep-dev
add-front-dep-dev: select-env ## Add frontend development dependency
	@sh -c 'read -p "Enter the dependency name for development: " dep_name && \
	echo "Installing dependency: $$dep_name" && \
	$(COMPOSE) exec frontend sh -c \
	"bun add -d $$dep_name"'

.PHONY: remove-front-dep
remove-front-dep: select-env ## Remove frontend dependency
	@sh -c 'read -p "Enter the dependency name: " dep_name && \
	echo "Removing dependency: $$dep_name" && \
	$(COMPOSE) exec frontend sh -c \
	"bun remove $$dep_name"'

#--------------- LINT/FORMAT COMMANDS ---------------#

.PHONY: run-back-lint
run-back-lint: select-env ## Run linting for backend code
	@$(COMPOSE) exec backend sh -c \
	"poetry run ruff check --config=ruff.toml"

.PHONY: run-back-format
run-back-format: select-env ## Format backend code
	@$(COMPOSE) exec backend sh -c \
	"poetry run ruff format --config=ruff.toml"

.PHONY: run-front-lint
run-front-lint: select-env ## Run linting for frontend code
	@$(COMPOSE) exec frontend sh -c \
	"bun run lint"

.PHONY: run-front-format
run-front-format: select-env ## Format frontend code
	@$(COMPOSE) exec frontend sh -c \
	"bun run format"
