# Development Guide

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/get-docker/)
- [GNU Make](https://www.gnu.org/software/make/)
- [pre-commit](https://pre-commit.com/#install) for code quality checks (optional)

### 1. Clone the repository

```bash
git clone https://github.com/teenxsky/wb-analytics.git
cd wb-analytics
```

### 2. Set up environment variables

```bash
cp deployments/dev/conf/.env.local deployments/dev/conf/.env.local
```

Edit the `.env.local` file with your settings.

### 3. Set up pre-commit hooks (optional)

Pre-commit ensures code quality and formatting before each commit.

```bash
pre-commit install
```

### 4. Build and start the development environment

From the project root:

```bash
make build
make up # or make up-logs
```

This will start:
- Nginx web server
- Django backend
- PostgreSQL database
- Frontend development server

### 4.1. Apply database migrations

After the containers are up, apply Django migrations:

```bash
make migrate
```

### 5. Access the application

The application will be available at:

- Frontend: http://localhost:80/ (development)
- Backend API: http://api.localhost:80/
- Backend admin panel: http://api.localhost:80/admin

### 6. Common Development Commands

### Docker Containers Management

- **Build for containers:**  
  ```bash
  make build
  ```
- **Start containers:**  
  ```bash
  make up
  ```
- **View container logs:**  
  ```bash
  make up-logs
  ```
- **Stop containers:**  
  ```bash
  make down
  ```
- **Clean environment:**  
  ```bash
  make clean
  ```

### Backend (Django)

- **Run Django tests:**  
  ```bash
  make run-tests
  ```
- **Create Django migrations:**  
  ```bash
  make makemigrations
  ```
- **Apply migrations:**  
  ```bash
  make migrate
  ```
- **Create superuser:**  
  ```bash
  make createsuperuser
  ```
- **Parse Wildberries products:**  
  ```bash
  make parse-wb-products
  ```
- **Enter backend shell:**  
  ```bash
  make shell-backend
  ```

### Dependency Management

- **Add backend dependency:**  
  ```bash
  make add-back-dep
  ```
- **Add backend dev dependency:**  
  ```bash
  make add-back-dep-dev
  ```
- **Add frontend dependency:**  
  ```bash
  make add-front-dep
  ```
- **Add frontend dev dependency:**  
  ```bash
  make add-front-dep-dev
  ```

### Code Quality

- **Lint backend code:**  
  ```bash
  make run-back-lint
  ```
- **Format backend code:**  
  ```bash
  make run-back-format
  ```
- **Lint frontend code:**  
  ```bash
  make run-front-lint
  ```
- **Format frontend code:**  
  ```bash
  make run-front-format
  ```

For all available commands, run:
```bash
make help
```

## Development Notes

1. The frontend development server runs on port 80 with hot-reloading
2. Backend API is available at http://api.localhost:80/ with hot-reloading
3. Production builds should be tested with `ENV=prod` before deployment
4. Database migrations should be applied to both dev and prod environments
```
