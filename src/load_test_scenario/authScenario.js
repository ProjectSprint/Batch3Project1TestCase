import http from "k6/http";
import { isUser } from "../caster/caster.js";
import { assert, isExists } from "../helper/assertion.js";
import { combine, generateRandomEmail, generateRandomPassword, withProbability } from "../helper/generator.js";
import { testPostJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @return {{isCreated:boolean, user: User | null}}
 */
export function doRegistration(config, user) {
  const featureName = "Register";
  const route = config.baseUrl + "/v1/auth";
  const positivePayload = {
    email: user.email,
    password: user.password,
    action: "create",
  };

  const res = http.post(route, JSON.stringify(positivePayload), {
    headers: { "Content-Type": "application/json" }
  })
  if (res.status === 409) {
    return {
      isCreated: false,
      user: user,
    }
  }
  const isSuccess = assert(
    res,
    "POST",
    positivePayload,
    { "Content-Type": "application/json" },
    `${featureName} | valid payload`,
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have email"]: (v) => isExists(v, "email"),
      ["should have token"]: (v) => isExists(v, "token"),
    },
    config,
  );
  if (isSuccess) {
    const json = res.json()
    if (isUser(json)) {
      return {
        isCreated: true,
        user: json,
      }
    }
  }
  return {
    isCreated: false,
    user: null,
  }
}
/** 
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {number} failedCaseProbability
 * return {User | undefined}
 * */
export function doLogin(config, user, failedCaseProbability) {
  const featureName = "Login";
  const route = config.baseUrl + "/v1/auth";
  const assertHandler = testPostJsonAssert;
  const positivePayload = {
    email: user.email,
    password: user.password,
    action: "login",
  };


  const result = assertHandler(
    "valid payload", featureName, route, positivePayload, {},
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email"]: (v) => isExists(v, "email"),
      ["should have token"]: (v) => isExists(v, "token"),
    },
    [], config, {},);

  withProbability(failedCaseProbability, () => {
    assertHandler(
      "email not exists", featureName, route,
      combine(positivePayload, {
        email: generateRandomEmail(),
      }),
      {},
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, {},)
  })

  if (result.isSuccess) {
    const json = result.res.json()
    console.log("login success:", json, isUser(json))
    if (isUser(json)) {
      return json
    }
  }
}
