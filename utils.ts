import { RestEndpointMethodTypes as GitHubApi } from "./deps.ts";

export async function allDataFromOctokit<T>(
  iter: AsyncIterableIterator<{ data: T[] }>,
) {
  const res = [];
  for await (const { data } of iter) {
    res.push(...data);
  }
  return res;
}

export type AllUsersResult = {
  owner: string;
  repo: string;
  issues: GitHubApi["issues"]["listForRepo"]["response"]["data"];
  issueComments: GitHubApi["issues"]["listCommentsForRepo"]["response"]["data"];
  contributors: GitHubApi["repos"]["listContributors"]["response"]["data"];
}[];

export type UserInfoResult =
  GitHubApi["users"]["getByUsername"]["response"]["data"][];
