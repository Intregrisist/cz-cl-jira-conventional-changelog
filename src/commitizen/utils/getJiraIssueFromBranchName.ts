import {execSync} from 'child_process';

const getJiraIssueFromBranchName = () => {
  const branchName = execSync('git branch --show-current').toString().trim();
  const jiraIssueRegex =
    /(?<jiraIssue>(?<!([a-zA-Z0-9]{1,10})-?)[a-zA-Z0-9]+-\d+)/;
  const matchResult = branchName.match(jiraIssueRegex);
  return matchResult?.groups?.jiraIssue;
};

export default getJiraIssueFromBranchName;
