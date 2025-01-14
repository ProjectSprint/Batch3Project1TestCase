import { isEmployee } from "../caster/caster.js";
import { isEqual, isEqualWith, isEveryItemContain, isEveryItemDifferent, isExists, isTotalDataInRange } from "../helper/assertion.js";
import { combine, generateRandomImageUrl, generateRandomName, generateRandomNumber, generateRandomUsername, generateTestObjects } from "../helper/generator.js";
import { testDeleteAssert, testGetAssert, testPatchJsonAssert, testPostJsonAssert } from "../helper/request.js";

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{departmentToTest?:Department} }opts
  * @returns { Employee[] | undefined | void }
 */
export function GetEmployeeTest(user, config, tags, opts) {
  const featureName = "Get Employee";
  const route = config.baseUrl + "/v1/employee";
  const assertHandler = testGetAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler("empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      config, tags,);
    const negativeHeaders = [
      { Authorization: `${user.token}`, },
      { Authorization: `Bearer asdf${user.token}`, },
      { Authorization: ``, },
    ];

    negativeHeaders.forEach((header) => {
      assertHandler("invalid token", featureName, route, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        config, tags,);
    });
  }

  assertHandler("valid payload", featureName, route, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
      ["should have gender"]: (v) => isExists(v, "[]gender"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
    },
    config, tags,);
  const paginationRes = assertHandler(
    "valid payload with pagination", featureName, route,
    { limit: 2, offset: 0 },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
      ["should have gender"]: (v) => isExists(v, "[]gender"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 2),
    },
    config,
    tags,
  );
  assertHandler(
    "valid payload with pagination offset", featureName, route,
    { limit: 2, offset: 2 },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
      ["should have gender"]: (v) => isExists(v, "[]gender"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 2),
      ['should have different data from offset 0']: (res) => isEveryItemDifferent(res, paginationRes.res, "[]identityNumber"),
    },
    config, tags,);
  assertHandler("valid payload with name query", featureName, route,
    { name: "a" },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ['should have names that contains "a"']: (v) => isEveryItemContain(v, "[]name", "a"),
      ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
      ["should have gender"]: (v) => isExists(v, "[]gender"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
    },
    config, tags,);
  const searchedGender = ["male", "female"][generateRandomNumber(0, 1)]
  assertHandler("valid payload with gender query", featureName, route,
    { gender: searchedGender },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
      ['should have gender matching the query']: (v) => isEqualWith(v, '[]gender', (a) => a.every(b => typeof b === "string" && b == searchedGender)),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
    },
    config, tags,);
  if (opts.departmentToTest) {
    const dept = opts.departmentToTest
    assertHandler("valid payload with identityNumber query", featureName, route,
      { departmentId: dept.departmentId },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
        ['should have departmentId matching the query']: (v) => isEqualWith(v, '[]departmentId', (a) => a.every(b => typeof b === "string" && b.includes(dept.departmentId))),
        ["should have name"]: (v) => isExists(v, "[]name"),
        ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
        ["should have gender"]: (v) => isExists(v, "[]gender"),
        ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
      },
      config, tags,);
  }
  const paginationResp = paginationRes.res.json()
  if (Array.isArray(paginationResp) && paginationResp.every(isEmployee)) {
    return paginationResp
  }
}

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{useFileUri?:string,departmentToTest:Department} }opts
  * @returns {Employee|undefined}
 */
export function PostEmployeeTest(user, config, tags, opts) {
  const featureName = "Post Employee";
  const route = config.baseUrl + "/v1/employee";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    name: generateRandomName(),
    departmentId: opts.departmentToTest.departmentId,
    employeeImageUri: opts.useFileUri ? opts.useFileUri : generateRandomImageUrl(),
    gender: ["male", "female"][generateRandomNumber(0, 1)],
    identityNumber: `${generateRandomNumber(10000, 999999999999999)}`
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler(
      "empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      [], config, tags);
    const negativeHeaders = [
      { Authorization: `${user.token}`, },
      { Authorization: `Bearer asdf${user.token}`, },
      { Authorization: ``, },
    ];

    negativeHeaders.forEach((header) => {
      assertHandler(
        "invalid token", featureName, route, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        [], config, tags);
    });
    const negativeTestObjects = generateTestObjects(
      {
        identityNumber: {
          type: "string",
          notNull: true,
          minLength: 5,
          maxLength: 33,
        },
        name: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 33,
        },
        employeeImageUri: {
          type: "string",
          notNull: true,
          isUrl: true
        },
        gender: {
          type: "string",
          notNull: true,
          enum: ["male", "female"]
        },
        departmentId: {
          type: "string",
          notNull: true,
        },
      },
      combine(positivePayload, { identityNumber: `${generateRandomNumber(10000, 999999999999999)}` }),
    );
    negativeTestObjects.forEach((payload) => {
      assertHandler(
        "invalid payload", featureName, route, payload, positiveHeader,
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [], config, tags);
    });
    assertHandler(
      "invalid content type", featureName, route, positivePayload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags);
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have departmentId"]: (v) => isExists(v, "departmentId"),
      ["should have identityNumber and equal"]: (v) =>
        isEqual(v, "identityNumber", positivePayload.identityNumber),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
      ["should have employeeImageUri and equal"]: (v) =>
        isEqual(v, "employeeImageUri", positivePayload.employeeImageUri),
      ["should have gender and equal"]: (v) =>
        isEqual(v, "gender", positivePayload.gender),
      ["should have departmentId and equal"]: (v) =>
        isEqual(v, "departmentId", positivePayload.departmentId),
    },
    [], config, tags);
  if (config.verifyChanges) {
    testGetAssert(
      "valid payload after update", featureName, route,
      {
        identityNumber: positivePayload.identityNumber
      },
      positiveHeader, {
      ["should return 200"]: (v) => v.status === 200,
      ["should have name and equal"]: (v) =>
        isEqualWith(v, "[]identityNumber", a => a.includes(positivePayload.identityNumber)),
    }, config, tags);
  }
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult && isEmployee(jsonResult)) {
      return jsonResult;
    }
  }
}

/**
 * @param {User} user
 * @param {Employee} employee
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{useFileUri?:string} }opts
  * @returns {Employee|undefined}
 */
export function PatchEmployeeTest(user, employee, config, tags, opts) {
  const featureName = "Patch Employee";
  const routeWithoutId = config.baseUrl + "/v1/employee";
  const route = routeWithoutId + `/${employee.identityNumber}`;
  const assertHandler = testPatchJsonAssert;


  const positivePayload = {
    name: generateRandomName(),
    departmentId: employee.departmentId,
    employeeImageUri: opts.useFileUri ? opts.useFileUri : generateRandomImageUrl(),
    gender: ["male", "female"][generateRandomNumber(0, 1)],
    identityNumber: `${generateRandomUsername()}`
  };

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler(
      "empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      [], config, tags,);
    const negativeHeaders = [
      { Authorization: `${user.token}`, },
      { Authorization: `Bearer asdf${user.token}`, },
      { Authorization: ``, },
    ];

    negativeHeaders.forEach((header) => {
      assertHandler(
        "invalid token", featureName, route, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        [], config, tags);
    });
    const negativeTestObjects = generateTestObjects(
      {
        identityNumber: {
          type: "string",
          notNull: true,
          minLength: 5,
          maxLength: 33,
        },
        name: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 33,
        },
        employeeImageUri: {
          type: "string",
          notNull: true,
          isUrl: true
        },
        gender: {
          type: "string",
          notNull: true,
          enum: ["male", "female"]
        },
        departmentId: {
          type: "string",
          notNull: true,
        },
      },
      combine(positivePayload, { identityNumber: `${generateRandomNumber(10000, 999999999999999)}` }),
    );
    negativeTestObjects.forEach((payload) => {
      assertHandler(
        "invalid payload", featureName, route, payload, positiveHeader,
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [], config, tags,);
    });
    assertHandler(
      "invalid content type", featureName, route, positivePayload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags,);
    assertHandler(
      "not exists id", featureName, `${routeWithoutId}/`, positivePayload, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, tags,);
    assertHandler(
      "invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, positivePayload, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      }, [], config, tags,);
  }

  const res = assertHandler(
    "valid payload",
    featureName,
    route,
    positivePayload,
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have departmentId"]: (v) => isExists(v, "departmentId"),
      ["should have identityNumber and equal"]: (v) =>
        isEqual(v, "identityNumber", positivePayload.identityNumber),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
      ["should have employeeImageUri and equal"]: (v) =>
        isEqual(v, "employeeImageUri", positivePayload.employeeImageUri),
      ["should have gender and equal"]: (v) =>
        isEqual(v, "gender", positivePayload.gender),
      ["should have departmentId and equal"]: (v) =>
        isEqual(v, "departmentId", positivePayload.departmentId),
    },
    [],
    config,
    tags,
  );
  if (config.verifyChanges) {
    testGetAssert(
      "valid payload after update",
      featureName,
      routeWithoutId,
      {
        identityNumber: positivePayload.identityNumber
      },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have identityNumber and equal"]: (v) =>
          isEqualWith(v, "[]identityNumber", a => a.includes(positivePayload.identityNumber)),
      },
      config,
      tags,
    );
  }

  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult && isEmployee(jsonResult)) {
      return jsonResult;
    }
  }
}

/**
 * @param {User} user
 * @param {Employee} employee
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function DeleteEmployeeTest(user, employee, config, tags) {
  const featureName = "Delete Employee";
  const routeWithoutId = config.baseUrl + "/v1/employee";
  const route = routeWithoutId + `/${employee.identityNumber}`;
  const assertHandler = testDeleteAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler(
      "empty token", featureName, route, {}, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      config, tags,);
    const negativeHeaders = [
      { Authorization: `${user.token}`, },
      { Authorization: `Bearer asdf${user.token}`, },
      { Authorization: ``, },
    ];

    negativeHeaders.forEach((header) => {
      assertHandler(
        "invalid token", featureName, route, {}, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        config, tags,);
    });
    assertHandler(
      "not exists id", featureName, `${routeWithoutId}/`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, tags,);
    assertHandler(
      "invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, tags,);
  }

  assertHandler(
    "valid payload", featureName, route, {}, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
    },
    config, tags,);
  if (config.verifyChanges) {
    testGetAssert(
      "valid payload after delete", featureName, routeWithoutId,
      {
        identityNumber: employee.identityNumber
      },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should not have identityNumber that is equal"]: (v) =>
          isEqualWith(v, "[]identityNumber", a => !a.includes(employee.identityNumber)),
      },
      config, tags,);
  }
}
