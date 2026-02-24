
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {

    stages : [
        { duration : '4s', target : 2 }, // ramp up to 2 users over 4 seconds
        { duration : '5s', target : 5 }, // stay at 5 users for 5 seconds
        { duration : '3s', target : 0 }, // ramp down to 0 users over 3 seconds
    ],

    // vus : 3,
    // duration : '10s',

    thresholds : {
        http_req_duration : ['p(95) < 400'], // 95% of requests should be below 400ms
        http_req_failed : ['rate < 0.1'], // Less than 10% of requests should fail
        checks : ['rate > 0.9'] // Ensure that at least 90% of checks pass
    }
}

export default function() {

    http.get('https://quickpizza.grafana.com/');


    // Add checks to validate the response
    check(response, {
        'response is 200': (r) => r.status === 200,
        'contains pizza': (r) => r.body.includes('pizza'),
    })


    sleep(1);
}