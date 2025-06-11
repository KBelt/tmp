# DevOps Karsten Belt project

Karsten Belt's submission for DevOps

## Service Status

| Service      | Tests                                                                                            | Lint                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| API Service  | [![API Lint](https://github.com/KBelt/tmp/actions/workflows/ci.yml/badge.svg)](https://github.com/KBelt/tmp/actions/workflows/ci.yml) 
| Item Service | [![Item Lint](https://github.com/KBelt/tmp/actions/workflows/ci.yml/badge.svg)](https://github.com/KBelt/tmp/actions/workflows/ci.yml) 

## Architecture

- API service: Handles HTTP requests and publishes messages
- Item service: Processes messages and stores data in MongoDB
- MongoDB: Database for persistent storage
- RabbitMQ: Message broker for service communication
- Prometheus & Grafana: Monitoring and visualization

## Local Development

```bash
# Start all services
docker-compose up -d

# Run tests
cd services/api && npm test
cd services/item-service && npm test

# Check code guidelines
cd services/api && npm run lint
cd services/item-service && npm run lint
```

## Monitoring

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
- RabbitMQ Management: http://localhost:15672 (guest/guest)

## API Endpoints

- Items API: http://localhost:3001/items
- API health Check: http://localhost:3001/health
