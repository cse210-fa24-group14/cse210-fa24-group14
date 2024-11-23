.PHONY: install
install:
	@echo "🔧 Installing dependencies"
	@npm install
	@npx playwright install chromium

.PHONY: test-code-quality
test-code-quality:
	@echo "🧪 Checking code quality"
	@npx eslint

.PHONY: test-unit
test-unit:
	@echo "🧪 unit tests"
	@npx jest tests/unit --verbose --coverage

.PHONY: test-e2e
test-e2e:
	@echo "🧪 e2e tests"
	@npx playwright test --project=e2e
