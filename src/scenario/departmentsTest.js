import { isDepartment } from "../assert/test.js";
import { isEqual, isEqualWith, isExists, isTotalDataInRange } from "../helper/assertion.js";
import { generateRandomName, generateTestObjects } from "../helper/generator.js";
import { testDeleteAssert, testGetAssert, testPatchJsonAssert, testPostJsonAssert } from "../helper/request.js";

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function GetDepartmentTest(user, config, tags) {
  const featureName = "Get Department";
  const route = config.baseUrl + "/v1/department";
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
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
    },
    config, tags,);
  const paginationRes = assertHandler("valid payload with pagination", featureName, route,
    { limit: 2, offset: 0 },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 2),

    },
    config, tags,);
  assertHandler("valid payload with pagination offset", featureName, route,
    { limit: 2, offset: 2 },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have departmentId"]: (v) => isExists(v, "[]departmentId"),
      ["should have name"]: (v) => isExists(v, "[]name"),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 2),
      ['should have different data from offset 0']: (res) => {
        try {
          const resp = res.json()
          const paginationResp = paginationRes.res.json()
          if (Array.isArray(resp) &&
            Array.isArray(paginationResp) &&
            resp.every(isDepartment) &&
            paginationResp.every(isDepartment)) {
            return resp.every(e => {
              return paginationResp.every(a => a.departmentId !== e.departmentId)
            })
          }
        } catch (err) {
          return false
        }
        return false
      },
    },
    config,
    tags,
  );
  assertHandler("valid payload with name query", featureName, route,
    { name: "a" },
    positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ['should have names that contains "a"']: (v) => isEqualWith(v, '[]name', (a) => a.every(b => typeof b === "string" && b.includes("a"))),
      ['should have the correct total data based on pagination']: (v) => isTotalDataInRange(v, '[]', 1, 5),
    },
    config, tags,);
}

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {Department|undefined} 
 */
export function PostDepartmentTest(user, config, tags) {
  const featureName = "Post Department";
  const route = config.baseUrl + "/v1/department";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    name: generateRandomName(),
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler("empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      }, [], config, tags,
    );
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
        [], config, tags,);
    });
    const negativeTestObjects = generateTestObjects(
      {
        name: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 33,
        },
      },
      positivePayload,
    );
    negativeTestObjects.forEach((payload) => {
      assertHandler("invalid payload", featureName, route, payload, positiveHeader,
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [], config, tags,);
    });
    assertHandler("invalid content type", featureName, route, positivePayload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags,);
  }

  const res = assertHandler("valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have departmentId"]: (v) => isExists(v, "departmentId"),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
    },
    [], config, tags,);
  if (config.verifyChanges) {
    testGetAssert("valid payload after update", featureName, route,
      {
        name: positivePayload.name
      },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have name and equal"]: (v) =>
          isEqualWith(v, "[]name", a => a.includes(positivePayload.name)),
      },
      config, tags,);
  }

  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return {
        departmentId: /** @type {Department} */ (jsonResult).departmentId,
        name: /** @type {Department} */ (jsonResult).name,
      };
    }
  }
}

/**
 * @param {User} user
 * @param {Department} department
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {Department | undefined}
 */
export function PatchDepartmentTest(user, department, config, tags) {
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
  if (config.runNegativeCase) {
    assertHandler("empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      [], config, tags,
    );
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
        [], config, tags,);
    });
    const negativeTestObjects = generateTestObjects(
      {
        name: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 33,
        },
      },
      positivePayload,
    );
    negativeTestObjects.forEach((payload) => {
      assertHandler("invalid payload", featureName, route, payload, positiveHeader,
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [], config, tags,);
    });
    assertHandler("invalid content type", featureName, route, positivePayload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags,);
    assertHandler("not exists id", featureName, `${routeWithoutId}/`, positivePayload, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, tags,);
    assertHandler("invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, positivePayload, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, tags,
    );
  }

  const res = assertHandler("valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have departmentId"]: (v) => isExists(v, "departmentId"),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
    },
    [], config, tags,
  );
  if (config.verifyChanges) {
    testGetAssert("valid payload after update", featureName, routeWithoutId,
      {
        name: positivePayload.name
      },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have name and equal"]: (v) =>
          isEqualWith(v, "[]name", a => a.includes(positivePayload.name)),
      },
      config, tags,);
  }

  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return {
        departmentId: /** @type {Department} */ (jsonResult).departmentId,
        name: /** @type {Department} */ (jsonResult).name,
      };
    }
  }
}

/**
 * @param {User} user
 * @param {Department} department
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function DeleteDepartmentTest(user, department, config, tags) {
  const featureName = "Delete Department";
  const routeWithoutId = config.baseUrl + "/v1/department";
  const route = routeWithoutId + `/${department.departmentId}`;
  const assertHandler = testDeleteAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler("empty token", featureName, route, {}, {}, {},
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
      assertHandler("invalid token", featureName, route, {}, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        config, tags,);
    });
    assertHandler("not exists id", featureName, `${routeWithoutId}/`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, tags,);
    assertHandler("invalid id", featureName, `${routeWithoutId}/${generateRandomName()}`, {}, {}, positiveHeader,
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      config, tags,);
  }

  assertHandler("valid payload", featureName, route, {}, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
    },
    config, tags,);
  if (config.verifyChanges) {
    testGetAssert("valid payload after delete", featureName, routeWithoutId,
      {
        name: department.name.substring(0, 2)
      },
      positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have name and equal"]: (v) =>
          isEqualWith(v, "[]name", a => a.every(e => e != department.name)),
      },
      config, tags,);
  }

}
