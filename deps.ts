// octokit typeing in esm.sh is worng...
import type { Api } from "https://esm.sh/v102/@octokit/plugin-rest-endpoint-methods@6.7.0/dist-types/types.d.ts";
import type { PaginateInterface } from "https://esm.sh/v102/@octokit/plugin-paginate-rest@5.0.1/dist-types/index.d.ts";
import {
  Octokit,
  RestEndpointMethodTypes,
} from "https://esm.sh/@octokit/rest@19.0.5";

const GITHUB_TOKEN =
  "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";

export const octokit: Api & { paginate: PaginateInterface } = new Octokit({
  auth: GITHUB_TOKEN,
});
export type { RestEndpointMethodTypes };
