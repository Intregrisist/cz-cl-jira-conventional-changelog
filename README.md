# cz-cl-jira-conventional-changelog

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

A Commitizen and Commitlint adapter for Jira commit messages.

## Follows Conventional Commit v1.0.0

```
<type>[optional scope]: <jira-issue><description>

[optional body]

[optional footer(s)]
```

## Configuration

| Environment Variable | Config Option  | Default | Type      | Description                                                         |
|----------------------|----------------|---------|-----------|---------------------------------------------------------------------|
| CZ_MAX_HEADER_WIDTH  | maxHeaderWidth | 72      | `number`  | Maximum length allowed for the commit message header.               |
| CZ_MIN_HEADER_WIDTH  | minHeaderWidth | 1       | `number`  | Minimum length required for the commit message header.              |
| CZ_JIRA_OPTIONAL     | jiraOptional   | true    | `boolean` | If set to `true` it will allow user to skip entering a jira issue.  |
|                      |                |         |           |                                                                     |
|                      |                |         |           |                                                                     |

