import { file } from "k6/http";
import http from 'k6/http';
import { isExists } from "../helper/assertion.js";
import { testPostMultipartAssert } from "../helper/request.js";

/**
 * @param {User} user
 * @param {{small: ArrayBuffer, smallName:string,medium: ArrayBuffer, mediumName:string,big: ArrayBuffer, bigName: string,invalid: ArrayBuffer,invalidName:string}} fileToTest
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {string | undefined} uri
 */
export function UploadFileTest(user, fileToTest, config, tags) {
  const featureName = "Upload File";
  const route = config.baseUrl + "/v1/file";
  const assertHandler = testPostMultipartAssert;

  const positivePayload = {
    file: http.file(fileToTest.small, fileToTest.smallName)
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
      config, tags,);
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
        config, tags,
      );
    });
    assertHandler(
      "invalid file type", featureName, route, {
      file: file(fileToTest.invalid, fileToTest.invalidName)
    },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      config, tags,);
    assertHandler(
      "invalid file size", featureName, route,
      {
        file: file(fileToTest.big, fileToTest.bigName)
      },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      config, tags,
    );
    assertHandler(
      "invalid content type", featureName, route, positivePayload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      config, tags,);
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have uri"]: (v) => isExists(v, "uri"),
    },
    config, tags,
  );
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return /** @type {{uri:string}} */ (jsonResult).uri
    }
  }
}
