# Бейдж для встречи — статичная страница для OBS/камеры

PORT ?= 8080

.DEFAULT_GOAL := help
.PHONY: help build run test clean

help: ## Показать список команд
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

build: ## Сборка не требуется (статичная страница)
	@echo "Статичная страница — сборка не требуется."

run: ## Запустить локальный сервер и открыть бейдж
	npx serve -l $(PORT) --no-clipboard

test: ## Тестов нет
	@echo "Тестов нет."

clean: ## Артефактов сборки нет
	@echo "Артефактов сборки нет."
