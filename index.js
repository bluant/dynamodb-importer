const dotenv = require("dotenv");
dotenv.config();

const {
  DynamoDBClient,
  ScanCommand, // To scan the source table
  PutItemCommand, // To put items into the local table
  GetItemCommand
} = require("@aws-sdk/client-dynamodb");

const {
  LOCAL_DYNAMO_URL,
  LOCAL_DYNAMO_REGION,
  LOCAL_DYNAMO_AWS_KEY,
  LOCAL_DYNAMO_AWS_SECRET,
  SOURCE_DYNAMO_REGION,
  SOURCE_DYNAMO_AWS_KEY,
  SOURCE_DYNAMO_AWS_SECRET,
  TABLE_TO_IMPORT,
} = process.env;

const localDynamoDBClient = new DynamoDBClient({
  endpoint: LOCAL_DYNAMO_URL,
  region: LOCAL_DYNAMO_REGION,
  credentials: {
    accessKeyId: LOCAL_DYNAMO_AWS_KEY,
    secretAccessKey: LOCAL_DYNAMO_AWS_SECRET,
  },
});

const sourceDynamoDBClient = new DynamoDBClient({
  region: SOURCE_DYNAMO_REGION,
  credentials: {
    accessKeyId: SOURCE_DYNAMO_AWS_KEY,
    secretAccessKey: SOURCE_DYNAMO_AWS_SECRET,
  },
});

const copyData = async () => {
  try {
    let newItemsCount = 0; // Counter for new items added
    let updatedItemsCount = 0; // Counter for items updated
    // Scan the source DynamoDB table to retrieve items
    const scanInput = {
      TableName: TABLE_TO_IMPORT,
    };
    const scanCommand = new ScanCommand(scanInput);
    const scanResponse = await sourceDynamoDBClient.send(scanCommand);

    if (!scanResponse.Items || scanResponse.Items.length === 0) {
      console.log(`No items found in ${TABLE_TO_IMPORT}. No data to copy.`);
      return;
    }

    // Iterate through each item in the source table
    for (const sourceItem of scanResponse.Items) {
     
      // Check if the item with the same primary key exists in the local table
      const getItemInput = {
        TableName: TABLE_TO_IMPORT,
        Key: {
          PK: {
            S: sourceItem.PK.S, // Assuming PK is within pix4d
          },

          SK: {
            S: sourceItem.SK.S
          }
          // Add other components of the primary key if applicable (e.g., SK)
        },
      };
      try {
        const localItemResponse = await localDynamoDBClient.send(new GetItemCommand(getItemInput));

        // Check if the local item exists and if it's different from the source item
        if (!localItemResponse.Item || !areItemsEqual(localItemResponse.Item, sourceItem)) {
          // If the local item doesn't exist or is different, put the source item into the local table
          const putInput = {
            TableName: TABLE_TO_IMPORT,
            Item: sourceItem,
          };
          const putCommand = new PutItemCommand(putInput);
          await localDynamoDBClient.send(putCommand);
          console.log(`Item with primary key ${JSON.stringify(sourceItem.PK.S)} copied.`);
          updatedItemsCount++; // Increment the updated items counter

        } else {
          console.log(`Item with primary key ${JSON.stringify(sourceItem.PK.S)} is up to date. Skipping.`);

        }
      } catch (error) {
        if (error.name === "ResourceNotFoundException") {
          // Item doesn't exist in the local table, so insert it
          const putInput = {
            TableName: TABLE_TO_IMPORT,
            Item: sourceItem,
          };
          const putCommand = new PutItemCommand(putInput);
          await localDynamoDBClient.send(putCommand);
          console.log(`Item with primary key ${JSON.stringify(sourceItem.PK.S)} copied.`);
          newItemsCount++; // Increment the new items counter

        } else {
          throw error; // Re-throw unexpected errors
        }
      }
    }

    console.log(`Data copied from ${TABLE_TO_IMPORT} to the local DynamoDB table.`);
    console.log(`New items added: ${newItemsCount}`);
    console.log(`Items updated: ${updatedItemsCount}`);
    } catch (error) {
    console.error("Error copying data:", error);
  }
};

// Function to compare two DynamoDB items for equality
function areItemsEqual(item1, item2) {
  // Check if both items are objects
  if (typeof item1 === 'object' && typeof item2 === 'object') {
    const keys1 = Object.keys(item1);
    const keys2 = Object.keys(item2);

    // Check if the keys are the same
    if (keys1.length !== keys2.length || !keys1.every(key => keys2.includes(key))) {
      return false;
    }

    // Recursively compare each key-value pair
    for (const key of keys1) {
      if (!areItemsEqual(item1[key], item2[key])) {
        return false;
      }
    }

    return true;
  }

  // For non-object types, use strict equality (===) to compare
  return item1 === item2;
}



// Call the function to copy data
copyData();
