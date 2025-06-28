COMPOSE_DEV = docker compose -f ./deployments/dev/docker-compose.yaml \
			--env-file=./deployments/dev/conf/.env.local

COMPOSE_PROD = docker compose -f ./deployments/prod/docker-compose.yaml \
			--env-file=./deployments/prod/conf/.env.local


.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' \
	$(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

#--------------- PRODUCTION COMMANDS ---------------#

.PHONY: build
build: ## Build the Docker images for the production environment
	@$(COMPOSE_PROD) build

.PHONY: up
up: ## Start the production environment
	@$(COMPOSE_PROD) up -d

.PHONY: up-logs
up-logs: ## Start the production environment and display logs
	@$(COMPOSE_PROD) up

.PHONY: down
down: ## Stop the production environment
	@$(COMPOSE_DEV) down

.PHONY: clean
clean: ## Clean up the production environment
	@$(COMPOSE_PROD) down --rmi all

.PHONY: clean-volumes
clean-volumes: ## Clean up the production environment volumes
	@$(COMPOSE_PROD) down -v

.PHONY: run-tests
run-tests: ## Run tests for the production environment
	@$(COMPOSE_PROD) exec backend sh -c \
	"poetry run python manage.py test apps"


#------------------------------------------------------------#



#--------------- DEVELOPMENT COMMANDS ---------------#

#--------------- DOCKER COMPOSE COMMANDS ---------------#

.PHONY: build-dev
build-dev: ## Build the Docker images for the development environment
	@$(COMPOSE_DEV) build

.PHONY: up-dev
up-dev: ## Start the development environment
	@$(COMPOSE_DEV) up -d

.PHONY: up-logs-dev
up-logs-dev: ## Start the development environment and display logs
	@$(COMPOSE_DEV) up

.PHONY: down-dev
down-dev: ## Stop the development environment
	@$(COMPOSE_DEV) down

.PHONY: clean-dev
clean-dev: ## Clean up the development environment
	@$(COMPOSE_DEV) down --rmi all

.PHONY: clean-volumes-dev
clean-volumes-dev: ## Clean up the development environment volumes
	@$(COMPOSE_DEV) down -v

.PHONY: restart-dev
restart-dev: ## Restart the development environment
	@$(COMPOSE_DEV) restart


#--------------- BACKEND COMMANDS ---------------#

.PHONY: add-back-dep
add-back-dep: ## Add backend dependency to stage environment
	@sh -c 'read -p "Enter the dependency name: " dep_name && \
	echo "Installing dependency: $$dep_name" && \
	$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry add $$dep_name"'

.PHONY: add-back-dep-dev
add-back-dep-dev: ## Add backend dependency to the development environment
	@sh -c 'read -p "Enter the dependency name for development: " dep_name && \
	echo "Installing dependency: $$dep_name" && \
	$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry add $$dep_name --dev"'

.PHONY: remove-back-dep
remove-back-dep: ## Remove backend dependency from stage environment
	@sh -c 'read -p "Enter the dependency name: " dep_name && \
	echo "Removing dependency: $$dep_name" && \
	$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry remove $$dep_name"'

.PHONY: migrate-dev
migrate-dev: ## Run Django migrations for the development environment
	@$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry run python manage.py migrate"

.PHONY: makemigrations-dev
makemigrations-dev: ## Make migrations for the development environment
	@sh -c 'read -p "Enter the django app(apps) name(names) [Enter for All]: " app_name && \
	$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry run python manage.py makemigrations $$app_name"'

.PHONY: startapp-dev
startapp-dev: ## Create a new Django app in the development environment
	@sh -c 'read -p "Enter the django app name: " app_name && \
	echo "Creating Django app: $$app_name" && \
	$(COMPOSE_DEV) exec backend sh -c \
	"cd src/apps && poetry run python ../manage.py startapp $$app_name"'

.PHONY: createsuperuser-dev
createsuperuser-dev: ## Create a superuser in the development environment
	@$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry run python manage.py createsuperuser"

.PHONY: shell-backend-dev
shell-backend-dev: ## Start a shell in the development environment
	@$(COMPOSE_DEV) exec backend sh

.PHONY: run-tests-dev
run-tests-dev: ## Run tests for the development environment
	@$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry run python manage.py test apps"

.PHONY: run-tests-app-dev
run-tests-app-dev: ## Run tests for the development environment
	@sh -c 'read -p "Enter the django app name: " app_name && \
	echo "Testing Django app: $$app_name" && \
	$(COMPOSE_DEV) exec backend sh -c \
	"cd src && poetry run python manage.py test apps.$$app_name.tests"'


#--------------- LINT/FORMAT COMMANDS ---------------#


.PHONY: run-back-lint
run-back-lint: ## Run linting for backend code
	@$(COMPOSE_DEV) exec backend sh -c \
	"poetry run ruff check --config=ruff.toml"

.PHONY: run-back-format
run-back-formatter: ## Format backend code
	@$(COMPOSE_DEV) exec backend sh -c \
	"poetry run ruff format --config=ruff.toml"
