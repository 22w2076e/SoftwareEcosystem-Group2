// 1. wicg内の全リポジトリ一覧を取得

import { allDataFromOctokit } from "./utils.ts";
import { octokit } from "./deps.ts";

const org = "WICG";

const res = await allDataFromOctokit(octokit.paginate.iterator(
  octokit.rest.repos.listForOrg,
  { org, per_page: 100 },
));

const text = JSON.stringify(res, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./1_all_repos.json")),
  `${text}\n`,
);
