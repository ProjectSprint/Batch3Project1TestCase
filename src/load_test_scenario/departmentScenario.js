import { isDepartment } from "../caster/caster.js";
import { isEqual, isEveryItemContain, isExists, isTotalDataInRange } from "../helper/assertion.js";
import { generateRandomName, generateRandomWord, withProbability } from "../helper/generator.js";
import { testDeleteAssert, testGetAssert, testPatchJsonAssert, testPostJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {number} failedCaseProbability
 * @returns {Department | undefined}
 */
export function doPostDepartment(config, user, failedCaseProbability) {
  const featureName = "Post Department";
  const route = config.baseUrl + "/v1/department";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    name: generateRandomName(),
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  withProbability(failedCaseProbability, () => {
    assertHandler("invalid payload", featureName, route,
      {
        name: "a".repeat(35)
      },
      positiveHeader,
      {
        ["should return 400"]: (v) => v.status === 400,
      },
      [], config, {});
  })

  const res = assertHandler("valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have departmentId"]: (v) => isExists(v, "departmentId"),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
    },
    [], config, {},);

  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult && isDepartment(jsonResult)) {
      return {
        departmentId: jsonResult.departmentId,
        name: jsonResult.name,
      };
    }
  }
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {number} edgeCaseProbability
 * @param {number} totalData
 * @return {Department[]} 
 */
export function doGetDepartment(config, user, edgeCaseProbability, totalData) {
  const featureName = "Get Department";
  const route = config.baseUrl + "/v1/department";
  const assertHandler = testGetAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  const departmentResult = assertHandler("valid payload with pagination", featureName, route,
    { limit: totalData, offset: 0 },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
    },
    config, {},);
  withProbability(edgeCaseProbability, () => {
    const query = generateRandomWord(1, 2)
    assertHandler("valid payload with name query", featureName, route,
      { name: query },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ['should have names that contains the query']: (v) => isEveryItemContain(v, "[]name", query),
        ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
      },
      config, {},);
    assertHandler("valid payload with pagination offset", featureName, route,
      { limit: totalData, offset: totalData },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
        ["should have name"]: (v) => isExists(v, "[]name"),
        ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),
      },
      config, {},);
    withProbability(edgeCaseProbability, () => {
      assertHandler("valid payload with pagination offset", featureName, route,
        { limit: totalData, offset: totalData * 2 },
        positiveHeader,
        {
          ["should return 200"]: (v) => v.status === 200,
          ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
          ["should have name"]: (v) => isExists(v, "[]name"),
          ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),
        },
        config, {},);
      withProbability(edgeCaseProbability, () => {
        assertHandler("valid payload with pagination offset", featureName, route,
          { limit: totalData, offset: totalData * 3 },
          positiveHeader,
          {
            ["should return 200"]: (v) => v.status === 200,
            ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
            ["should have name"]: (v) => isExists(v, "[]name"),
            ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, totalData),
          },
          config, {},);
      })
    })
  })
  if (departmentResult.isSuccess) {
    const departments = departmentResult.res.json()
    if (Array.isArray(departments) && departments.every(isDepartment)) {
      return departments
    }
  }
  return []
}

/**
 * @param {User} user
 * @param {Department} department
 * @param {import("../types/config.d.ts").Config} config
 * @param {number} failedCaseProbability
 * @returns {Department | undefined}
 */
export function doPatchDepartment(config, user, department, failedCaseProbability) {
  const featureName = "Patch Department";
  const routeWithoutId = config.baseUrl + "/v1/department";
  const route = routeWithoutId + `/${department.departmentId}`;
  const assertHandler = testPatchJsonAssert;

  const positivePayload = {
    name: generateRandomName(),
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  withProbability(failedCaseProbability, () => {
    assertHandler("invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, positivePayload, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, {},
    );
  })
  const res = assertHandler("valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have departmentId"]: (v) => isExists(v, "departmentId"),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
    },
    [], config, {},
  );
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult && isDepartment(jsonResult)) {
      return {
        departmentId: jsonResult.departmentId,
        name: jsonResult.name,
      };
    }
  }
}

/**
 * @param {User} user
 * @param {Department} department
 * @param {import("../types/config.d.ts").Config} config
 * @param {number} failedCaseProbability
 */
export function doDeleteDepartment(config, user, department, failedCaseProbability) {
  const featureName = "Delete Department";
  const routeWithoutId = config.baseUrl + "/v1/department";
  const route = routeWithoutId + `/${department.departmentId}`;
  const assertHandler = testDeleteAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  withProbability(failedCaseProbability, () => {
    assertHandler("invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, {},);
  })

  assertHandler("valid payload", featureName, route, {}, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
    },
    config, {},);
}

