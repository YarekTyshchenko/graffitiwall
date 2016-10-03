all: build

.PHONY: build
build:
	docker build -t yarekt/graffitiwall-static .

.PHONY: run
run:
	docker run --rm -it yarekt/graffitiwall-static bash

.PHONY: start stop
start: stop
	docker run -d --name graffitiwall-static -p 8080:8080 \
		yarekt/graffitiwall-static

stop:
	@docker rm -vf graffitiwall-static ||:
