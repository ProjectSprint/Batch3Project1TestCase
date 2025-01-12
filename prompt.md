based on this example

```
// single_test.js
import { LoginTest, RegisterTest } from "./src/scenario/authTest.js"
import { DeleteDepartmentTest, PatchDepartmentTest, PostDepartmentTest } from "./src/scenario/departmentsTest.js"
import { generateRandomNumber } from "./src/helper/generator.js"
import { DeleteEmployeeTest, PatchEmployeeTest, PostEmployeeTest } from "./src/scenario/employeeTest.js"
import { fail } from 'k6';
import { UploadFileTest } from "./src/scenario/fileTest.js";

export const options = {
  vus: 1,
  iterations: 1
};

export default function() {
  /** @type {import("./src/types/config.js").Config} */
  const config = {
    baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
    debug: __ENV.DEBUG ? true : false,
    runNegativeCase: true,
    verifyChanges: true
  }
  const tags = {
    env: "local"
  }

  // ===== AUTH TEST =====
  const user = RegisterTest(config, tags)
  if (!user)
    fail("test stop on Register feature, please check the logs")
  LoginTest(user, config, tags)

  // ===== UPLOAD TEST =====
  const fileUri = UploadFileTest(user, config, tags)

  // ===== DEPARTMENT TEST =====
  // create 100 department for test
  /** @type {Department[]} */
  let departments = []
  for (let index = 0; index < 100; index++) {
    let department = PostDepartmentTest(user, config, tags)
    if (!department)
      fail(`test stop on Post Department feature loop ${index}, please check the logs`)
    departments.push(department)
  }

  let pickedDepartmentIndex = generateRandomNumber(0, departments.length)
  const department = PatchDepartmentTest(user, departments[pickedDepartmentIndex], config, tags)
  if (!department)
    fail("test stop on patch Department feature, please check the logs")
  DeleteDepartmentTest(user, department, config, tags)
  departments = departments.splice(pickedDepartmentIndex, 1)


  // ===== EMPLOYEE TEST =====
  pickedDepartmentIndex = generateRandomNumber(0, departments.length)
  /** @type {Employee[]} */
  let employees = []
  for (let index = 0; index < 100; index++) {
    let employee = PostEmployeeTest(user, config, tags, {
      departmentToTest: departments[pickedDepartmentIndex],
      useFileUri: fileUri
    })
    if (!employee)
      fail(`test stop on Post Employee feature loop ${index}, please check the logs`)
    employees.push(employee)
  }

  let pickedEmployeeIndex = generateRandomNumber(0, employees.length)
  const employee = PatchEmployeeTest(user, employees[pickedEmployeeIndex], config, tags, {
    useFileUri: fileUri
  })
  if (!employee)
    fail("test stop on patch Employee feature, please check the logs")
  DeleteEmployeeTest(user, employees[pickedEmployeeIndex], config, tags)
  employees = employees.splice(pickedEmployeeIndex, 1)
}
```

and each function contract
```
/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {User} user
 * @returns {User | undefined}
 */
export function LoginTest(user, config, tags) {
...
```
/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {User | undefined}
 */
export function RegisterTest(config, tags) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {string | undefined} uri
 */
export function UploadFileTest(user, config, tags) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function GetProfileTest(user, config, tags) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{useFileUris?:string[],userCollideInformation?:User} }opts
  * @returns { User | undefined } more complete user
 */
export function PatchProfileTest(user, config, tags, opts) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function GetDepartmentTest(user, config, tags) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {Department|undefined} 
 */
export function PostDepartmentTest(user, config, tags) {
```
```
/**
 * @param {User} user
 * @param {Department} department
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {Department | undefined}
 */
export function PatchDepartmentTest(user, department, config, tags) {
```
```
/**
 * @param {User} user
 * @param {Department} department
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function DeleteDepartmentTest(user, department, config, tags) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{departmentToTest?:Department} }opts
  * @returns { Employee[] | undefined | void }
 */
export function GetEmployeeTest(user, config, tags, opts) {
```
```
/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{useFileUri?:string,departmentToTest:Department} }opts
  * @returns {Employee|undefined}
 */
export function PostEmployeeTest(user, config, tags, opts) {
```
```
/**
 * @param {User} user
 * @param {Employee} employee
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{useFileUri?:string} }opts
  * @returns {Employee|undefined}
 */
export function PatchEmployeeTest(user, employee, config, tags, opts) {
```
```
/**
 * @param {User} user
 * @param {Employee} employee
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function DeleteEmployeeTest(user, employee, config, tags) {
```
```
type User = {
  token: string;
  email: string;
  password: string;
  name?: string;
  userImageUri?: string;
  companyName?: string;
  companyImageUri?: string;
};

type Department = {
  departmentId: string;
  name: string;
}
type Employee = {
  identityNumber: string;
  name: string;
  employeeImageUri: string;
  gender: string;
  departmentId: string;
};
```

please generate a load_test.js which follows the information according to this html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Data Visualization (Times)</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div style="width: 95%; margin: 20px auto;">
        <canvas id="loadTestChart"></canvas>
    </div>

    <script>
        const vuRanges = ['0 (00:00)', '50 (00:30)', '200 (01:00)', '800 (02:00)', '1500 (03:00)', '3000 (03:30)', '6000 (04:00)', '10000 (05:00)'];
        
        const data = {
            'Auth (register)': [0.01,1, 0.8, 0.3, 0.1, 0.05, 0.01, 0.01],
            'Auth (login)': [0.01,0.1, 0.2, 0.7, 0.9, 0.95, 0.99, 0.99],
            'Profile GET': [0.01,10, 20, 20, 30, 50, 60, 60],
            'Profile PATCH': [0.01,0.2, 0.5, 0.8, 0.6, 0.4, 0.8, 0.8],
            'Upload POST': [0.01,5, 5, 4, 3, 2, 3, 3],
            'Employee GET': [0.01,14, 30, 100, 200, 200, 200, 200],
            'Employee POST': [0.01,14, 15, 8, 4, 2, 2, 1],
            'Employee DELETE': [0.01,0.05, 0.2, 0.3, 0.25, 0.2, 0.1, 0.2],
            'Employee PATCH': [0.01,0.2, 0.3, 1.5, 1, 0.8, 0.8, 1],
            'Departments GET': [0.01,15, 15, 200, 120, 100, 80, 70],
            'Departments POST': [0.01,1, 1, 0.5, 0.2, 0.1, 0.02, 0.03],
            'Departments PATCH': [0.01,0.2, 0.2, 0.15, 0.1, 0.05, 0.1, 0.1],
            'Departments DELETE': [0.01,0.05, 0.05, 0.08, 0.05, 0.03, 0.03, 0.03]
        };

        const endpoints = Object.keys(data);
        const datasets = endpoints.map((endpoint, index) => ({
            label: endpoint,
            data: data[endpoint],
            borderColor: `hsl(${(index * 360) / endpoints.length}, 70%, 50%)`,
            tension: 0.4,
            fill: false
        }));

        const ctx = document.getElementById('loadTestChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: vuRanges,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'API Endpoints Usage Across Virtual Users (VU) Ranges (Times Used)',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} times`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: 'Number of Times Used'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Virtual Users (VU) Range'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
```

and the load test should be stopped if:
Udah menyentuh latency > 2s
Error rate udah > 5%
