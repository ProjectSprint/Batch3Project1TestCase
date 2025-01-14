import { isUser } from "../caster/caster.js";
import { isEqual } from "../helper/assertion.js";
import { generateRandomImageUrl, generateRandomName } from "../helper/generator.js";
import { testGetAssert, testPatchJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @returns {User | undefined} user
 */
export function doGetProfile(config, user) {
  const featureName = "Get Profile";
  const route = config.baseUrl + "/v1/user";
  const assertHandler = testGetAssert;

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };

  const res = assertHandler(
    "valid payload", featureName, route, {}, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
    },
    config, {},);

  const jsonResult = res.res.json();
  if (jsonResult && isUser(jsonResult)) {
    return jsonResult;
  }
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @returns {User | undefined} user
 */
export function doPatchProfile(config, user) {
  const featureName = "Patch Profile";
  const route = config.baseUrl + "/v1/user";
  const assertHandler = testPatchJsonAssert;

  const positivePayload = {
    email: user.email,
    name: generateRandomName(),
    userImageUri: generateRandomImageUrl(),
    companyName: generateRandomName(),
    companyImageUri: generateRandomImageUrl(),
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
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
    [], config, {},
  );
  const jsonResult = res.res.json();
  if (jsonResult && isUser(jsonResult)) {
    return jsonResult;
  }
}
