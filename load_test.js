import { SharedArray } from 'k6/data';
import redis, { Client } from 'k6/experimental/redis';
import { combine, generateRandomEmail, generateRandomNumber, generateRandomPassword, withProbability } from './src/helper/generator.js';
import { doLogin, doRegistration } from './src/load_test_scenario/authScenario.js';
import { doUpload } from './src/load_test_scenario/fileScenario.js';
import { doDeleteDepartment, doGetDepartment, doPatchDepartment, doPostDepartment } from './src/load_test_scenario/departmentScenario.js';
import { doDeleteEmployee, doGetEmployee, doPatchEmployee, doPostEmployee } from './src/load_test_scenario/employeeScenario.js';
import { doGetProfile, doPatchProfile } from './src/load_test_scenario/profileScenario.js';
export const options = {
  scenarios: {
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50, },
        //{ duration: '30s', target: 200, },
        //{ duration: '1m', target: 800, },
        //{ duration: '1m', target: 1500, },
        //{ duration: '30s', target: 3000, },
        //{ duration: '30s', target: 6000, },
        //{ duration: '1m', target: 6000, }
      ]
    }
  },
  thresholds: {
    http_req_duration: [{
      threshold: 'avg < 2000', // Average latency below 2s
      abortOnFail: true,
      delayAbortEval: '10s'
    }],
  }
};

const smallFile = open('./src/figure/image-50KB.jpg', 'b');
const medFile = open('./src/figure/image-100KB.jpg', 'b');
const bigFile = open('./src/figure/image-200KB.jpg', 'b');
const invalidFile = open('./src/figure/sql-5KB.sql', 'b');
const redisClient = new Client('redis://localhost:6379')

const data = new SharedArray('some name', function() {
  /** @type {User[]} */
  const res = []
  for (let index = 0; index < 200; index++) {
    res.push({
      email: generateRandomEmail(),
      password: generateRandomPassword(8, 32), token: ""
    })
  }
  return res
});
export default async function() {
  const config = {
    baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
    debug: __ENV.DEBUG ? true : false,
    runNegativeCase: true,
    verifyChanges: true
  }
  let usr = doRegistration(config, data[Math.floor(Math.random() * data.length)])
  if (!usr.isCreated && usr.user) {
    let token = ""
    try {
      token = await redisClient.get(usr.user.email)
    } catch (err) { }
    if (token) {
      usr.user = combine(usr.user, { token: token })
      usr.isCreated = true
    } else {
      const loginRes = doLogin(config, usr.user, 0.1)
      if (loginRes) {
        usr.user = loginRes
        usr.isCreated = true
      }
    }
  } if (usr.isCreated && usr.user) {
    await redisClient.set(usr.user.email, usr.user.token, 0.1);
  } else {
    return;
  }
  if (!usr.user) {
    return;
  }
  const user = usr.user

  withProbability(0.2, () => {
    doUpload(config, user, 0.1, {
      small: smallFile,
      smallName: "small.jpg",
      medium: medFile,
      mediumName: "med.jpg",
      big: bigFile,
      bigName: "big.jpg",
      invalid: invalidFile,
      invalidName: "invalid.sql",
    })
  })

  //=== profile & file test ===
  doGetProfile(config, user)
  withProbability(0.2, () => {
    doPatchProfile(config, user)
  })
  withProbability(0.2, () => {
    doUpload(config, user, 0.3, {
      small: smallFile,
      smallName: "small.jpg",
      medium: medFile,
      mediumName: "med.jpg",
      big: bigFile,
      bigName: "big.jpg",
      invalid: invalidFile,
      invalidName: "invalid.sql",
    })
  })

  //=== department test ===
  let departments = doGetDepartment(config, user, 0.5, generateRandomNumber(5, 10))
  if (!departments.length) {
    for (let index = 0; index < 10; index++) {
      const department = doPostDepartment(config, user, 0.1)
      if (department) {
        departments.push(department)
      }
    }
  }

  withProbability(0.2, () => {
    const department = doPostDepartment(config, user, 0.1)
    if (department) {
      departments.push(department)
    }
  })
  withProbability(0.2, () => {
    const selectedIndex = generateRandomNumber(0, departments.length)
    const department = doPatchDepartment(config, user, departments[selectedIndex], 0.1)
    if (department) {
      departments[selectedIndex] = department
    }
  })
  withProbability(0.1, () => {
    const selectedIndex = generateRandomNumber(0, departments.length)
    doDeleteDepartment(config, user, departments[selectedIndex], 0.1)
    departments.splice(selectedIndex, 1)
  })

  //=== department test ===
  const selectedDeptIndex = generateRandomNumber(0, departments.length)
  let employees = doGetEmployee(config, user, 0.5, generateRandomNumber(5, 10))
  if (!employees.length) {
    for (let index = 0; index < 20; index++) {
      const employee = doPostEmployee(config, user, departments[selectedDeptIndex].departmentId, 0.1)
      if (employee) {
        employees.push(employee)
      }
    }
  }
  withProbability(0.2, () => {
    const employee = doPostEmployee(config, user, departments[selectedDeptIndex].departmentId, 0.1)
    if (employee) {
      employees.push(employee)
    }
  })
  withProbability(0.2, () => {
    const selectedIndex = generateRandomNumber(0, employees.length)
    const employee = doPatchEmployee(config, user, employees[selectedIndex], 0.1)
    if (employee) {
      employees[selectedIndex] = employee
    }
  })
  withProbability(0.1, () => {
    const selectedIndex = generateRandomNumber(0, employees.length)
    doDeleteEmployee(config, user, employees[selectedIndex], 0.1)
    employees.splice(selectedIndex, 1)
  })
}

