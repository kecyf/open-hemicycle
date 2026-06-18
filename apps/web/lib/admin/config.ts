import { Octokit } from "octokit";

export function getRepoOwner(): string {
  return process.env.GITHUB_REPO_OWNER ?? "kecyf";
}

export function getRepoName(): string {
  return process.env.GITHUB_REPO_NAME ?? "open-hemicycle";
}

export function createOctokit(): Octokit | null {
  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) return null;
  return new Octokit({ auth: token });
}

export function githubRepoUrl(): string {
  return `https://github.com/${getRepoOwner()}/${getRepoName()}`;
}
