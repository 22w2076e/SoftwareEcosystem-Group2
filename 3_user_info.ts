// 3. ユーザーごとに詳細情報を取得

// deno lsp is slow, because of large file.
// import allRepos from "./2_all_users.json" assert { type: "json" };
import { type AllUsersResult } from "./utils.ts";
import { octokit } from "./deps.ts";

const allRepos: AllUsersResult = JSON.parse(
  await Deno.readTextFile(new URL(import.meta.resolve("./2_all_users.json"))),
);

// 全ユーザーを取得（重複は削除）
const users = allRepos.reduce(
  (res, { issues, issueComments, contributors }) => {
    for (const issue of issues) {
      if (issue.user && issue.user.type === "User") {
        res.add(issue.user.login);
      }
    }
    for (const issueComment of issueComments) {
      if (issueComment.user && issueComment.user.type === "User") {
        res.add(issueComment.user.login);
      }
    }
    for (const contributor of contributors) {
      if (contributor.login && contributor.type === "User") {
        res.add(contributor.login);
      }
    }
    return res;
  },
  new Set<string>(),
);

// それぞれのユーザーに対して詳細情報を取得する
const res = [];

for (const [i, username] of [...users].entries()) {
  const { data } = await octokit.rest.users.getByUsername({ username });
  res.push(data);
  console.log(`${username}: ok (${i + 1}/${users.size})`);
}

const text = JSON.stringify(res, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./3_user_info.json")),
  `${text}\n`,
);
