MOCHA_OPTS=
REPORTER = spec

check: test

test: test-unit

test-w: 
	$(MAKE) test MOCHA_OPTS=--watch REPORTER=min

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-cov: lib-cov
	@PALAVER_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	./node_modules/.bin/jscover lib lib-cov

clean:
	rm -f coverage.html
	rm -fr lib-cov

.PHONY: test test-unit clean test-w
