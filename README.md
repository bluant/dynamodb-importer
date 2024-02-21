# DynamoDB Data Copier

This Node.js application facilitates the copying of data from a source DynamoDB table to a local DynamoDB table. It's designed to help with the migration of data in development or testing environments, where it's often necessary to replicate data from production or staging tables without affecting the original source.

## Features

- Copies all data from a source DynamoDB table to a local DynamoDB table.
- Checks for existing items and updates them if they differ from the source.
- Counts and logs the number of new items added and existing items updated.

## Prerequisites

- Node.js installed on your machine.
- Access to AWS DynamoDB tables.
- AWS credentials with permissions to read from the source table and write to the target table.

## Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/bluant/dynamodb-importer
   ```
2. **Navigate to the project directory**:
   ```sh
    cd dynamodb-importer
   ```
3. **Install dependencies**:

Run the following command to install the necessary Node.js packages:
   ```sh
    cd dynamodb-importer
   ```
## Configuration
Create a .env file in the root of your project directory and specify your AWS and DynamoDB settings:
   ```env
    LOCAL_DYNAMO_URL=http://localhost:8000
    LOCAL_DYNAMO_REGION=your-local-region
    LOCAL_DYNAMO_AWS_KEY=your-local-access-key
    LOCAL_DYNAMO_AWS_SECRET=your-local-secret-access-key
    SOURCE_DYNAMO_REGION=your-source-region
    SOURCE_DYNAMO_AWS_KEY=your-source-access-key
    SOURCE_DYNAMO_AWS_SECRET=your-source-secret-access-key
    TABLE_TO_IMPORT=your-table-name
   ```
Replace the placeholders with your actual AWS and DynamoDB configuration details.

## Usage
To start the data copying process, run the script with Node.js:
   ```sh
    node index.js
   ```
Replace index.js with the actual name of the script file if different.

## Notes
- Ensure the source and local DynamoDB tables have the same schema.
- The script assumes the presence of PK and SK as primary key attributes. Modify the script if your table uses different attribute names for the primary key.
- Monitor the console output for progress updates and any errors encountered during the copying process.

DynamoDB Data Copier offers a straightforward solution for replicating DynamoDB data, simplifying development and testing workflows.