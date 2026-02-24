# K6 Performance Testing — General Guide

This is a general reference for writing, running, and analyzing load tests with k6. It is project-agnostic and intended for adding to a personal GitHub profile or knowledge base.

## Overview
- k6 is a modern load testing tool for testing APIs and web services. Tests are written in JavaScript and executed from the command line.

## Install
- macOS / Linux: `brew install k6` or download from https://k6.io
- Windows: download the executable or use `choco install k6` if you use Chocolatey.

## Basic Concepts
- Virtual Users (VUs): concurrent virtual clients.
- Duration: how long the test runs.
- Iterations: number of times a VU runs the default function.
- Thresholds: pass/fail conditions based on metrics.
- Scenarios: advanced load patterns (ramping, constant-arrival-rate, etc.).

## Minimal k6 Script
```js
import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('https://test-api.example.com/');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

Run: `k6 run script.js`

## Common Options
- `--vus` and `--duration` for quick runs.
- `--iterations` to run a fixed number of iterations.
- `--out` to export results (influxdb, json, etc.).
- `--summary-export=summary.json` to capture the summary programmatically.

Example: `k6 run --vus 50 --duration 1m --summary-export=summary.json script.js`

## Scenarios (recommended for realistic tests)
```js
export let options = {
  scenarios: {
    ramping: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
    },
  },
};
```

## Checks and Thresholds
- Use `check` for functional assertions within VU code.
- Use `thresholds` in `options` to make CI fail on SLO violations.

Example thresholds:
```js
export let options = {
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
};
```

## Metrics to Watch
- `http_req_duration` — request latency distribution.
- `vus` / `vus_max` — concurrent users.
- `http_reqs` — total requests.
- `checks` — percentage of checks passing.
- `errors` / `http_req_failed` — error rates.

## Output & Analysis
- Export to InfluxDB + Grafana for dashboarding: `--out influxdb=http://host:8086/k6`
- Export summary JSON for CI: `--summary-export=summary.json`
- Use the k6 HTML output tool or community exporters for richer reports.

## CI Integration (GitHub Actions example)
```yaml
name: k6 Load Test
on: [push]
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install k6
        run: sudo apt-get update && sudo apt-get install -y k6
      - name: Run k6
        run: k6 run --summary-export=summary.json tests/loadtest.js
      - name: Upload summary
        uses: actions/upload-artifact@v4
        with:
          name: k6-summary
          path: summary.json
```

## Best Practices
- Start small: smoke test functionality before large-scale runs.
- Use scenarios to model real user behavior (think time, pacing, user journeys).
- Add thresholds to enforce SLOs in CI.
- Monitor the system under test (CPU, memory, DB connections) during runs.
- Keep test scripts deterministic and idempotent.

## Troubleshooting
- If VUs are stuck or no traffic is generated, check for blocking code or infinite loops.
- High error rates: verify endpoints, DNS, and upstream dependencies.
- If local machine is the bottleneck, offload to cloud runners or use distributed k6 (k6 cloud).

## Resources
- Official: https://k6.io/docs
- Examples: https://k6.io/docs/examples
- k6 community on GitHub and Slack

---
This guide is intentionally concise for use as a general reference on a GitHub profile or wiki. Expand with project-specific examples and dashboards as needed.
