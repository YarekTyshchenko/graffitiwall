all: build

.PHONY: build
build:
	docker build -t yarekt/graffitiwall .

.PHONY: run
run:
	docker run --rm -it yarekt/graffitiwall bash

.PHONY: start stop
start: stop
	docker run -d --name graffitiwall -p 12346:12346 \
		yarekt/graffitiwall

stop:
	@docker rm -vf graffitiwall ||:

.PHONY: logs
logs:
	docker logs -f graffitiwall

version=latest
push:
	docker tag yarekt/graffitiwall gcr.io/graffitiwall-145317/graffitiwall:$(version)
	docker push gcr.io/graffitiwall-145317/graffitiwall:$(version)
