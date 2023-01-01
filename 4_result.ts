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
  Record<string, { issueCommentCount: number; contributionCount: number }>
> = {};
const contributionPerUser: Record<
  string,
  { issueCommentCount: number; contributionCount: number }
> = {};
for (const { owner, repo, issues, issueComments, contributors } of allRepos) {
  const contributionPerRepo: Record<
    string,
    { issueCommentCount: number; contributionCount: number }
  > = {};
  for (const issue of issues) {
    if (issue.user && issue.user.type === "User") {
      contributionPerRepo[issue.user.login] ??= {
        issueCommentCount: 0,
        contributionCount: 0,
      };
      contributionPerRepo[issue.user.login].issueCommentCount++;
      contributionPerUser[issue.user.login] ??= {
        issueCommentCount: 0,
        contributionCount: 0,
      };
      contributionPerUser[issue.user.login].issueCommentCount++;
    }
  }
  for (const issueComment of issueComments) {
    if (issueComment.user && issueComment.user.type === "User") {
      contributionPerRepo[issueComment.user.login] ??= {
        issueCommentCount: 0,
        contributionCount: 0,
      };
      contributionPerRepo[issueComment.user.login].issueCommentCount++;
      contributionPerUser[issueComment.user.login] ??= {
        issueCommentCount: 0,
        contributionCount: 0,
      };
      contributionPerUser[issueComment.user.login].issueCommentCount++;
    }
  }
  for (const contributor of contributors) {
    if (contributor.login && contributor.type === "User") {
      contributionPerRepo[contributor.login] ??= {
        issueCommentCount: 0,
        contributionCount: 0,
      };
      contributionPerRepo[contributor.login].contributionCount++;
      contributionPerUser[contributor.login] ??= {
        issueCommentCount: 0,
        contributionCount: 0,
      };
      contributionPerUser[contributor.login].contributionCount++;
    }
  }

  contributions[`${owner}/${repo}`] = contributionPerRepo;
}

const contributionsText = JSON.stringify(contributions, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./4_contributions.json")),
  `${contributionsText}\n`,
);

// 4-2. ユーザーのデータから必要な部分だけ抽出して整形

const res = users.map(({
  login: userId,
  company,
  location,
  twitter_username,
  public_repos,
  followers,
  following,
}) => ({
  userId,
  issueCommentCount: contributionPerUser[userId].issueCommentCount,
  contributionCount: contributionPerUser[userId].contributionCount,
  company,
  location,
  twitter_username,
  public_repos,
  followers,
  following,
})).sort((a, b) =>
  (b.issueCommentCount + b.contributionCount) -
  (a.issueCommentCount + a.contributionCount)
);

const text = JSON.stringify(res, null, 2);
await Deno.writeTextFile(
  new URL(import.meta.resolve("./4_result.json")),
  `${text}\n`,
);
