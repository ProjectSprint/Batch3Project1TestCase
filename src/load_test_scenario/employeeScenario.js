import { isEmployee } from "../caster/caster.js";
import { isEqual, isEqualWith, isEveryItemContain, isExists, isTotalDataInRange } from "../helper/assertion.js";
import { combine, generateRandomImageUrl, generateRandomName, generateRandomNumber, generateRandomUsername, generateRandomWord, withProbability } from "../helper/generator.js";
import { testDeleteAssert, testGetAssert, testPatchJsonAssert, testPostJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {string} departmentId
 * @param {number} failedCaseProbability
  * @returns {Employee | undefined}
 */
export function doPostEmployee(config, user, departmentId, failedCaseProbability) {
  const featureName = "Post Employee";
  const route = config.baseUrl + "/v1/employee";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    name: generateRandomName(),
    departmentId: departmentId,
    employeeImageUri: generateRandomImageUrl(),
    gender: ["male", "female"][generateRandomNumber(0, 1)],
    identityNumber: `${generateRandomNumber(10000, 999999999999999)}`
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  withProbability(failedCaseProbability, () => {
    assertHandler(
      "invalid payload", featureName, route, combine(positivePayload, {}), positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      [], config, {});
  })
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
    [], config, {});
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult && isEmployee(jsonResult)) {
      return jsonResult;
    }
  }
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {number} offetCaseProbability
 * @param {number} totalData
  * @returns {Employee[] }
 */
export function doGetEmployee(config, user, offetCaseProbability, totalData) {
  const featureName = "Get Employee";
  const route = config.baseUrl + "/v1/employee";
  const assertHandler = testGetAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  const paginationRes = assertHandler(
    "valid payload with pagination", featureName, route,
    { limit: totalData, offset: 0 },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
      ["should have gender"]: (v) => isExists(v, "[]gender"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),

    },
    config, {},
  );
  withProbability(offetCaseProbability, () => {
    const query = generateRandomWord(1, 2)
    assertHandler("valid payload with name query", featureName, route,
      { name: query },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have identityNumber"]: (v) => isExists(v, "[]identityNumber"),
        ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
        ['should have names that contains the query']: (v) => isEveryItemContain(v, "[]name", query),
        ["should have employeeImageUri"]: (v) => isExists(v, "[]employeeImageUri"),
        ["should have gender"]: (v) => isExists(v, "[]gender"),
        ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
      },
      config, {},);
    assertHandler(
      "valid payload with pagination offset", featureName, route,
      { limit: totalData, offset: totalData },
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
      config, {},);
    withProbability(offetCaseProbability, () => {
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
        config, {},);
    })
  })
  const paginationResp = paginationRes.res.json()
  if (Array.isArray(paginationResp) && paginationResp.every(isEmployee)) {
    return paginationResp
  }
  return []
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {Employee} employee
 * @param {number} errorCaseProbability
  * @returns {Employee | undefined}
 */
export function doPatchEmployee(config, user, employee, errorCaseProbability) {
  const featureName = "Patch Employee";
  const routeWithoutId = config.baseUrl + "/v1/employee";
  const route = routeWithoutId + `/${employee.identityNumber}`;
  const assertHandler = testPatchJsonAssert;


  const positivePayload = {
    name: generateRandomName(),
    departmentId: employee.departmentId,
    employeeImageUri: generateRandomImageUrl(),
    gender: ["male", "female"][generateRandomNumber(0, 1)],
    identityNumber: `${generateRandomUsername()}`
  };

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
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
    {},
  );
  withProbability(errorCaseProbability, () => {
    assertHandler(
      "invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, positivePayload, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      }, [], config, {},);
  })
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult && isEmployee(jsonResult)) {
      return jsonResult;
    }
  }
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {Employee} employee
 * @param {number} errorCaseProbability
 */
export function doDeleteEmployee(config, user, employee, errorCaseProbability) {
  const featureName = "Delete Employee";
  const routeWithoutId = config.baseUrl + "/v1/employee";
  const route = routeWithoutId + `/${employee.identityNumber}`;
  const assertHandler = testDeleteAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  withProbability(errorCaseProbability, () => {
    assertHandler(
      "invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, {},);
  })
  assertHandler(
    "valid payload", featureName, route, {}, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
    },
    config, {},);
}
