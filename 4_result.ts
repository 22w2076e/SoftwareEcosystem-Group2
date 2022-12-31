// 4. データを整形し最終結果を出力

// deno lsp is slow, because of large file.
// import allRepos from "./2_all_users.json" assert { type: "json" };
// import users from "./3_user_info.json" assert { type: "json" };
import { type AllUsersResult, type UserInfoResult } from "./utils.ts";

const allRepos: AllUsersResult = JSON.parse(
  await Deno.readTextFile(new URL(import.meta.resolve("./2_all_users.json"))),
);
const users: UserInfoResult = JSON.parse(
  await Deno.readTextFile(new URL(import.meta.resolve("./3_user_info.json"))),
);

// 4-1. リポジトリごとのユーザーのコントリビュート回数をカウント（issueコメント回数&コミット回数）

const contributions: Record<
  string,
  Record<string, { issueComments: number; contributions: number }>
> = {};
for (const { owner, repo, issues, issueComments, contributors } of allRepos) {
  const contributionForRepo: Record<
    string,
    { issueComments: number; contributions: number }
  > = {};
  for (const issue of issues) {
    if (issue.user && issue.user.type === "User") {
      contributionForRepo[issue.user.login] ??= {
        issueComments: 0,
        contributions: 0,
      };
      contributionForRepo[issue.user.login].issueComments++;
    }
  }
  for (const issueComment of issueComments) {
    if (issueComment.user && issueComment.user.type === "User") {
      contributionForRepo[issueComment.user.login] ??= {
        issueComments: 0,
        contributions: 0,
      };
      contributionForRepo[issueComment.user.login].issueComments++;
    }
  }
  for (const contributor of contributors) {
    if (contributor.login && contributor.type === "User") {
      contributionForRepo[contributor.login] ??= {
        issueComments: 0,
        contributions: 0,
      };
      contributionForRepo[contributor.login].contributions++;
    }
  }

  contributions[`${owner}/${repo}`] = contributionForRepo;
}

const contributionsText = JSON.stringify(contributions, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./4_contributions.json")),
  `${contributionsText}\n`,
);

// 4-2. ユーザーのデータから必要な部分だけ抽出して整形

const res = users.map(({
  login,
  company,
  location,
  twitter_username,
  public_repos,
  followers,
  following,
}) => ({
  login,
  company,
  location,
  twitter_username,
  public_repos,
  followers,
  following,
}));

const text = JSON.stringify(res, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./4_result.json")),
  `${text}\n`,
);
