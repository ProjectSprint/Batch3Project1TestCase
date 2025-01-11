import { isEqual, isExists } from "../helper/assertion.js";
import {
  combine,
  generateRandomEmail,
  generateRandomPassword,
  generateTestObjects,
} from "../helper/generator.js";
import { testPostJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {User} user
 * @returns {User | undefined}
 */
export function LoginTest(user, config, tags) {
  const featureName = "Login";
  const route = config.baseUrl + "/v1/auth";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    email: user.email,
    password: user.password,
    action: "login",
  };

  if (config.runNegativeCase) {
    assertHandler(
      "empty body",
      featureName,
      route,
      {},
      {},
      {
        ["should return 400"]: (v) => v.status === 400,
      },
      [],
      config,
      tags,
    );

    const testObjects = generateTestObjects(
      {
        email: {
          type: "string",
          notNull: true,
          isEmail: true,
        },
        password: {
          type: "string",
          notNull: true,
          minLength: 8,
          maxLength: 32,
        },
        action: {
          type: "string",
          enum: ["login"],
          notNull: true,
        },
      },
      positivePayload,
    );
    testObjects.forEach((payload) => {
      assertHandler(
        "invalid payload",
        featureName,
        route,
        payload,
        {},
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [],
        config,
        tags,
      );
    });
    assertHandler(
      "email not exists",
      featureName,
      route,
      combine(positivePayload, {
        email: generateRandomEmail(),
      }),
      {},
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [],
      config,
      tags,
    );
  }

  const res = assertHandler(
    "valid payload",
    featureName,
    route,
    positivePayload,
    {},
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
      ["should have token"]: (v) => isExists(v, "token"),
    },
    [],
    config,
    tags,
  );

  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return {
        token: /** @type {User} */ (jsonResult).token,
        password: /** @type {User} */ (jsonResult).password,
        email: positivePayload.email,
      };
    }
  }
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {User | undefined}
 */
export function RegisterTest(config, tags) {
  const featureName = "Register";
  const route = config.baseUrl + "/v1/auth";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    email: generateRandomEmail(),
    password: generateRandomPassword(),
    action: "create",
  };

  if (config.runNegativeCase) {
    assertHandler(
      "empty body",
      featureName,
      route,
      {},
      {},
      {
        ["should return 400"]: (v) => v.status === 400,
      },
      [],
      config,
      tags,
    );

    const testObjects = generateTestObjects(
      {
        email: {
          type: "string",
          notNull: true,
          isEmail: true,
        },
        password: {
          type: "string",
          notNull: true,
          minLength: 8,
          maxLength: 32,
        },
        action: {
          type: "string",
          enum: ["create"],
          notNull: true,
        },
      },
      positivePayload,
    );
    testObjects.forEach((payload) => {
      assertHandler(
        "invalid payload",
        featureName,
        route,
        payload,
        {},
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [],
        config,
        tags,
      );
    });
  }

  const res = assertHandler(
    "valid payload",
    featureName,
    route,
    positivePayload,
    {},
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have email"]: (v) => isExists(v, "email"),
      ["should have token"]: (v) => isExists(v, "token"),
    },
    [],
    config,
    tags,
  );
  if (config.runNegativeCase) {
    testPostJsonAssert(
      "email conflict",
      featureName,
      route,
      positivePayload,
      {},
      {
        ["should return 409"]: (res) => res.status === 409,
      },
      [],
      config,
      tags,
    );
  }
  if (res.isSuccess) {
    const jsonResult = res.res.json("token");
    if (jsonResult) {
      return {
        token: /** @type {User} */ (jsonResult).token,
        password: /** @type {User} */ (jsonResult).password,
        email: positivePayload.email,
      };
    }
  }
}
