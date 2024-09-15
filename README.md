# DevQALink

## High-Level Goal

A framework that connects QA and development teams by offering a scheduling system to enable running test bundles on specific or latest development builds, receiving reports, and creating bug tickets.

## Entities

### QA Tests

- **Description**: A page where QA testers can define their tests.
- **Features**:
  - Title
  - Description
  - Steps
  - Automated Test Trigger (e.g., `python3.9 test_runner.py --arg1 value1 --arg2 value2 ...`)

### Dev Builds

- **Description**: A page to view application versions and builds.
- **Features**:
  - Display released versions and builds in progress.
  - Builds are updated daily (e.g., `1.0.0-100` today, `1.0.0-101` tomorrow).
  - Information is fetched from a 3rd party application and previewed in the framework.

### Resources

- **Description**: Manage resources needed for running QA tests on development builds.
- **Structure**:
  - **Pool**: Contains clusters.
  - **Cluster**: Contains servers.
  - **Server**: Identified by an IP address.
- **Features**:
  - Define and maintain pools, clusters, and servers.
  - Mark a server as a test runner.

### Scheduler

- **Description**: Define jobs that trigger test runs on development builds using specific resources.
- **Features**:
  - One-time runs and recurring automated runs.
  - Manage recurring jobs (e.g., delete, modify, activate/inactivate).
  - Implement a scheduling algorithm to allocate resources and manage job priorities (1-10).

### Executions

- **Description**: Preview active jobs and their progress.
- **Features**:
  - Display job status (e.g., waiting, running, available).
  - Reflect progress and resource allocation.

### Reports

- **Description**: Generate reports following job execution.
- **Features**:
  - Includes details such as Test, Version-Build, Cluster details, Test result, Failure reason, Runtime duration, Date, User.
  - Optional button to open a bug (e.g., using Jira).
  - Option to send the report to the user that triggered it.

## Bonus

- **AI Integration**: Consider an AI model to analyze execution logs and suggest the source of test failures (e.g., real version-build bug, test issue, cluster issue).

---
