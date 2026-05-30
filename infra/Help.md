infra/networks/create.sh && docker compose -f infra/docker-compose.yml up -d
or
cd infra/networks && ./create.sh && cd .. && docker compose up -d

dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d


prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d