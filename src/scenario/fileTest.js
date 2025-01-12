import { file } from "k6/http";
import { isExists } from "../helper/assertion.js";
import { testPostMultipartAssert } from "../helper/request.js";

/**
 * @param {User} user
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {string | undefined} uri
 */
export function UploadFileTest(user, config, tags) {
  const featureName = "Upload File";
  const route = config.baseUrl + "/v1/file";
  const assertHandler = testPostMultipartAssert;

  const positivePayload = {
    file: file("../figure/image-100KB.jpg"),
  };
  const positiveHeader = {
    Authorization: `bearer ${user.token}`,
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
      { Authorization: `bearer asdf${user.token}`, },
      { Authorization: ``, },
    ];

    negativeHeaders.forEach((header) => {
      assertHandler(
        "invalid token", featureName, route, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        [], config, tags,
      );
    });
    assertHandler(
      "invalid file type", featureName, route, {
      file: file("../figure/sql-5KB.sql")
    },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags,);
    assertHandler(
      "invalid file size", featureName, route,
      {
        file: file("../figure/image-200KB.jpg")
      },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags,
    );
    assertHandler(
      "invalid content type", featureName, route, positivePayload, positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      ["noContentType"], config, tags,);
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have uri"]: (v) => isExists(v, "uri"),
    },
    [], config, tags,
  );
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return /** @type {{uri:string}} */ (jsonResult).uri
    }
  }
}
