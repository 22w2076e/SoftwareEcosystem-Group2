// 2. リポジトリごとに会話や開発に参加したユーザーを取得

import allRepos from "./1_all_repos.json" assert { type: "json" };
import { allDataFromOctokit, AllUsersResult } from "./utils.ts";
import { octokit } from "./deps.ts";

// これらは管理用リポジトリなので取得対象外とする
const IGNORE_REPO_LIST = new Set([
  "wicg.github.io",
  "wicg.io",
  "admin",
  "starter-kit",
  "proposals",
]);

const repos = allRepos
  .filter((repo) => !IGNORE_REPO_LIST.has(repo.name) && !repo.archived)
  .map(({ owner: { login: owner }, name: repo }) => ({ owner, repo }));

const res: AllUsersResult = [];

for (const [i, { owner, repo }] of repos.entries()) {
  // issueに1番最初にコメントした人
  const issues = await allDataFromOctokit(octokit.paginate.iterator(
    octokit.rest.issues.listForRepo,
    { owner, repo, per_page: 100 },
  ));

  // issueに2番目以降にコメントした人
  const issueComments = await allDataFromOctokit(octokit.paginate.iterator(
    octokit.rest.issues.listCommentsForRepo,
    { owner, repo, per_page: 100 },
  ));

  // コードを書いてコミットした人
  const contributors = await allDataFromOctokit(octokit.paginate.iterator(
    octokit.rest.repos.listContributors,
    { owner, repo, per_page: 100 },
  ));

  res.push({
    owner,
    repo,
    issues: issues.map((issue) => {
      // issueの本文を入れるとデータ量が大きくなるが、今回の集計では不要なため削除
      // @ts-expect-error
      delete issue.title;
      delete issue.body;
      return issue;
    }),
    issueComments: issueComments.map((issueComment) => {
      // issueの本文を入れるとデータ量が大きくなるが、今回の集計では不要なため削除
      delete issueComment.body;
      return issueComment;
    }),
    contributors,
  });
  console.log(`${owner}/${repo}: ok (${i + 1}/${repos.length})`);
}

const text = JSON.stringify(res, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./2_all_users.json")),
  `${text}\n`,
);
