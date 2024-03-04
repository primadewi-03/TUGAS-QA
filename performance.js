import http from 'k6/http';
import { check, group, sleep} from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  vus: 1000, //number of virtual users
  iterations: 3500, //number of iterations
  thresholds: {
    // the rate of successful checks should be higher than 90%
    checks: ['rate > 0.9'],
    // max API response time
    http_req_duration: ['avg < 2000']
  },
};

const base_url = 'https://reqres.in';
const name = 'morpheus';
const job_create = 'leader';
const job_update = 'zion resident';

export default function () {
  const create_url = base_url + '/api/users';
  const update_url = base_url + '/api/users/2';
  const create_body = JSON.stringify({
    name: name,
    job: job_create,
  });
  const update_body = JSON.stringify({
    name: name,
    job: job_update,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const responses = http.batch([
    ['POST', create_url, create_body, params],
    ['PUT', update_url, update_body, params],
  ]);

  check(responses[0], {
    'Create user response status is 201': (r) => r.status == 201,
  });

  check(responses[0], {
    'Create user response name is same with request': (r) => {
      const response_body = JSON.parse(responses[0].body);
      return response_body.name === name
    },
  });

  check(responses[0], {
    'Creater user response job is same with request': (r) => {
      const response_body = JSON.parse(responses[0].body);
      return response_body.job === job_create
    },
  });

  check(responses[1], {
    'Update user response status is 200': (r) => r.status == 200,
  });

  check(responses[1], {
    'Update user response name is same with request': (r) => {
      const response_body = JSON.parse(responses[1].body);
      return response_body.name === name
    },
  });

  check(responses[1], {
    'Update user response job is same with request': (r) => {
      const response_body = JSON.parse(responses[1].body);
      return response_body.job === job_update
    },
  });
}

export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
  };
}
