#!/usr/bin/env sh
set -eu

pnpm test:e2e:setup

set +e
pnpm test:e2e:run
TEST_EXIT_CODE=$?
set -e

pnpm test:e2e:teardown

exit "$TEST_EXIT_CODE"
