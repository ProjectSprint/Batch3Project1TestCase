import { LoginTest, RegisterTest } from "./src/scenario/authTest.js"
import { DeleteDepartmentTest, GetDepartmentTest, PatchDepartmentTest, PostDepartmentTest } from "./src/scenario/departmentsTest.js"
import { generateRandomNumber } from "./src/helper/generator.js"
import { DeleteEmployeeTest, GetEmployeeTest, PatchEmployeeTest, PostEmployeeTest } from "./src/scenario/employeeTest.js"
import { fail } from 'k6';
import { UploadFileTest } from "./src/scenario/fileTest.js";
import { GetProfileTest, PatchProfileTest } from "./src/scenario/profileTest.js";

export const options = {
  vus: 1,
  iterations: 1
};

const smallFile = open('./src/figure/image-50KB.jpg', 'b');
const medFile = open('./src/figure/image-100KB.jpg', 'b');
const bigFile = open('./src/figure/image-200KB.jpg', 'b');
const invalidFile = open('./src/figure/sql-5KB.sql', 'b');

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
  let users = []
  for (let index = 0; index < 2; index++) {
    const user = RegisterTest(config, tags)
    if (!user)
      fail("test stop on Register feature, please check the logs")
    users.push(user)
  }
  const user = users[0]
  const collideUser = users[1]
  LoginTest(user, config, tags)

  // ===== UPLOAD TEST =====
  const fileUri = UploadFileTest(user, {
    small: smallFile,
    smallName: "small.jpg",
    medium: medFile,
    mediumName: "med.jpg",
    big: bigFile,
    bigName: "big.jpg",
    invalid: invalidFile,
    invalidName: "invalid.sql",
  }, config, tags)

  // ===== PROFILE TEST =====
  GetProfileTest(user, config, tags)
  PatchProfileTest(user, config, tags, { useFileUri: fileUri, userCollideInformation: collideUser })


  // ===== DEPARTMENT TEST =====
  // create 100 department for test
  /** @type {Department[]} */
  let departments = []
  for (let index = 0; index < 50; index++) {
    let department = PostDepartmentTest(user, config, tags)
    if (!department)
      fail(`test stop on Post Department feature loop ${index}, please check the logs`)
    departments.push(department)
  }
  GetDepartmentTest(user, config, tags)
  let pickedDepartmentIndex = generateRandomNumber(0, departments.length)
  const department = PatchDepartmentTest(user, departments[pickedDepartmentIndex], config, tags)
  if (!department) {
    fail("test stop on patch Department feature, please check the logs")
  }
  DeleteDepartmentTest(user, department, config, tags)
  departments.splice(pickedDepartmentIndex, 1)


  // ===== EMPLOYEE TEST =====
  pickedDepartmentIndex = generateRandomNumber(0, departments.length)
  /** @type {Employee[]} */
  let employees = []
  for (let index = 0; index < 50; index++) {
    let employee = PostEmployeeTest(user, config, tags, {
      departmentToTest: departments[pickedDepartmentIndex],
      useFileUri: fileUri
    })
    if (!employee) {
      fail(`test stop on Post Employee feature loop ${index}, please check the logs`)
    }
    employees.push(employee)
  }
  let pickedEmployeeIndex = generateRandomNumber(0, employees.length)
  GetEmployeeTest(user, config, tags, {
    departmentToTest: departments[pickedDepartmentIndex]
  })
  const employee = PatchEmployeeTest(user, employees[pickedEmployeeIndex], config, tags, {
    useFileUri: fileUri
  })
  if (!employee)
    fail("test stop on patch Employee feature, please check the logs")
  DeleteEmployeeTest(user, employee, config, tags)
  employees.splice(pickedEmployeeIndex, 1)
}

