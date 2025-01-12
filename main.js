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
  const user = RegisterTest(config, tags)
  if (!user)
    fail("test stop on Register feature, please check the logs")
  LoginTest(user, config, tags)

  UploadFileTest(user, config, tags)

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

  pickedDepartmentIndex = generateRandomNumber(0, departments.length)
  /** @type {Employee[]} */
  let employees = []
  for (let index = 0; index < 100; index++) {
    let employee = PostEmployeeTest(user, config, tags, {
      departmentToTest: departments[pickedDepartmentIndex]
    })
    if (!employee)
      fail(`test stop on Post Employee feature loop ${index}, please check the logs`)
    employees.push(employee)
  }

  let pickedEmployeeIndex = generateRandomNumber(0, employees.length)
  const employee = PatchEmployeeTest(user, employees[pickedEmployeeIndex], config, tags, {

  })
  if (!employee)
    fail("test stop on patch Employee feature, please check the logs")
  DeleteEmployeeTest(user, employees[pickedEmployeeIndex], config, tags)
  employees = employees.splice(pickedEmployeeIndex, 1)
}

