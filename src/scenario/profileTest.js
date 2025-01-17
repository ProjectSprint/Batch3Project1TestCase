import { isEqual } from "../helper/assertion.js";
import {
  combine,
  generateRandomImageUrl,
  generateRandomName,
  generateTestObjects,
} from "../helper/generator.js";
import { testGetAssert, testPatchJsonAssert } from "../helper/request.js";

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 */
export function GetProfileTest(user, config, tags) {
  const featureName = "Get Profile";
  const route = config.baseUrl + "/v1/user";
  const assertHandler = testGetAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler(
      "empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      config, tags,
    );
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
        config, tags,);
    });
  }

  assertHandler(
    "valid payload", featureName, route, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
    },
    config, tags,);
}

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {{useFileUri?:string,userCollideInformation?:User} }opts
  * @returns { User | undefined } more complete user
 */
export function PatchProfileTest(user, config, tags, opts) {
  const featureName = "Patch Profile";
  const route = config.baseUrl + "/v1/user";
  const assertHandler = testPatchJsonAssert;

  const positivePayload = {
    email: user.email,
    name: generateRandomName(),
    userImageUri: opts.useFileUri ? opts.useFileUri
      : generateRandomImageUrl(),
    companyName: generateRandomName(),
    companyImageUri: opts.useFileUri ? opts.useFileUri
      : generateRandomImageUrl(),
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
        [], config, tags,);
    });
    const negativeTestObjects = generateTestObjects(
      {
        email: {
          type: "string",
          notNull: true,
          isEmail: true,
        },
        name: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 52,
        },
        userImageUri: {
          type: "string",
          notNull: true,
          isUrl: true,
        },
        companyName: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 52,
        },
        companyImageUri: {
          type: "string",
          notNull: true,
          isUrl: true,
        },
      },
      positivePayload,
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
      ["noContentType"], config, tags,
    );
    if (opts.userCollideInformation) {
      assertHandler(
        "email duplicate", featureName, route,
        combine(positivePayload, {
          email: opts.userCollideInformation.email,
        }),
        positiveHeader,
        {
          ["should return 409"]: (res) => res.status === 409,
        },
        [], config, tags,);
    }
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
      ["should have name and equal"]: (v) =>
        isEqual(v, "name", positivePayload.name),
      ["should have userImageUri and equal"]: (v) =>
        isEqual(v, "userImageUri", positivePayload.userImageUri),
      ["should have companyName and equal"]: (v) =>
        isEqual(v, "companyName", positivePayload.companyName),
      ["should have companyImageUri and equal"]: (v) =>
        isEqual(v, "companyImageUri", positivePayload.companyImageUri),
    },
    [], config, tags,
  );
  if (config.verifyChanges) {
    testGetAssert(
      "valid payload after update", featureName, route, {}, positiveHeader,
      {
        ["should return 200"]: (v) => v.status === 200,
        ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
        ["should have name and equal"]: (v) =>
          isEqual(v, "name", positivePayload.name),
        ["should have userImageUri and equal"]: (v) =>
          isEqual(v, "userImageUri", positivePayload.userImageUri),
        ["should have companyName and equal"]: (v) =>
          isEqual(v, "companyName", positivePayload.companyName),
        ["should have companyImageUri and equal"]: (v) =>
          isEqual(v, "companyImageUri", positivePayload.companyImageUri),
      },
      config, tags,);
  }

  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return combine(user, {
        userImageUri: /** @type {User} */ (jsonResult).userImageUri,
        companyImageUri: /** @type {User} */ (jsonResult).companyImageUri,
        companyName: /** @type {User} */ (jsonResult).companyName,
        name: /** @type {User} */ (jsonResult).name,
      });
    }
  }
}
