# Бейдж для встречи — статичная страница для OBS/камеры

PORT ?= 8080
PAGES_REMOTE ?= origin
PAGES_BRANCH ?= main

.DEFAULT_GOAL := help
.PHONY: help build run test deploy clean

help: ## Показать список команд
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

build: ## Сборка не требуется (статичная страница)
	@echo "Статичная страница — сборка не требуется."

run: ## Запустить локальный сервер и открыть бейдж
	npx serve -l $(PORT) --no-clipboard

test: ## Проверить синтаксис анимаций
	node --check cat.js

deploy: test ## Опубликовать ветку main на GitHub Pages
	git push $(PAGES_REMOTE) $(PAGES_BRANCH):$(PAGES_BRANCH)

clean: ## Артефактов сборки нет
	@echo "Артефактов сборки нет."
