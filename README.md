## Boilerplate server


##### Technologies:
apollo | express | graphql | husky | jest | jsonwebtoken | node | pg | typeorm | typescript | winston

##### Create PSQL development database
```sh
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=username -e POSTGRES_DB=postgres_development --name postgres_development postgres
```

##### Create PSQL test database
```sh
docker run -d -p 5431:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=username -e POSTGRES_DB=postgres_test --name postgres_test postgres
```

##### Start
```sh
yarn install
yarn dev
```