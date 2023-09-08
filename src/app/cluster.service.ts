import { Injectable } from "@angular/core";
import * as AWS from "aws-sdk";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ClusterService {
  private ecs: AWS.ECS;

  constructor() {
    // Initialize the AWS ECS service with the appropriate region
    AWS.config.update({
      accessKeyId: environment.awsAccessKeyId,
      secretAccessKey: environment.awsSecretAccessKey,
      region: "us-east-1", // Set your desired AWS region
    });

    // Create an ECS instance
    this.ecs = new AWS.ECS();
  }


  // async listClustersWithStatus(): Promise<{ name: string; status: string }[]> {
  //   try {
  //     const allClusters: { name: string; status: string }[] = [];
  //     let nextToken: string | undefined = undefined;
  
  //     do {
  //       const params: AWS.ECS.Types.ListClustersRequest = {
  //         maxResults: 100, // Adjust this value as needed
  //       };
  
  //       if (nextToken) {
  //         params.nextToken = nextToken;
  //       }
  
  //       const response = await this.ecs.listClusters(params).promise();
  //       const clusterArns = response.clusterArns || [];
  
  //       const clusterStatusPromises = clusterArns.map(async (arn) => {
  //         const clusterName = arn.split("/").pop() as string;
  
  //         if (clusterName.startsWith("dino-test") || clusterName.startsWith("Dino-test")) {
  //           const describeResponse = await this.ecs
  //             .describeClusters({ clusters: [clusterName] })
  //             .promise();
  
  //           const clusterStatus =
  //             describeResponse.clusters && describeResponse.clusters.length
  //               ? describeResponse.clusters[0].status || "UNKNOWN"
  //               : "UNKNOWN"; // Provide a default value
  
  //           return { name: clusterName, status: clusterStatus };
  //         } else {
  //           return null; // Filter out clusters that don't start with 'dino-test'
  //         }
  //       });
  
  //       const clusterStatuses = await Promise.all(clusterStatusPromises);
  //       allClusters.push(...(clusterStatuses.filter((cluster) => cluster !== null) as { name: string; status: string }[]));
  
  //       nextToken = response.nextToken;
  //     } while (nextToken);
  
  //     console.log("Fetched clusters:", allClusters); // Add this line for debugging
  
  //     return allClusters;
  //   } catch (error) {
  //     console.error("Error listing clusters:", error);
  //     throw error;
  //   }
  // }

  // async listClustersWithStatus(): Promise<{ name: string; status: string; tasks: number }[]> {
  //   try {
  //     const allClusters: { name: string; status: string; tasks: number }[] = [];
  //     let nextToken: string | undefined = undefined;
  
  //     do {
  //       const params: AWS.ECS.Types.ListClustersRequest = {
  //         maxResults: 100, // Adjust this value as needed
  //       };
  
  //       if (nextToken) {
  //         params.nextToken = nextToken;
  //       }
  
  //       const response = await this.ecs.listClusters(params).promise();
  //       const clusterArns = response.clusterArns || [];
  
  //       const clusterStatusPromises = clusterArns.map(async (arn) => {
  //         const clusterName = arn.split("/").pop() as string;
  
  //         if (clusterName.startsWith("dino-test") || clusterName.startsWith("Dino-test")) {
  //           const describeResponse = await this.ecs
  //             .describeClusters({ clusters: [clusterName] })
  //             .promise();
  
  //           const clusterStatus =
  //             describeResponse.clusters && describeResponse.clusters.length
  //               ? describeResponse.clusters[0].status || "UNKNOWN"
  //               : "UNKNOWN"; // Provide a default value
  
  //           // Fetch information about tasks in the cluster
  //           const listTasksResponse = await this.ecs
  //             .listTasks({ cluster: clusterName })
  //             .promise();
  
  //           const taskCount = listTasksResponse.taskArns ? listTasksResponse.taskArns.length : 0;
  
  //           return { name: clusterName, status: clusterStatus, tasks: taskCount };
  //         } else {
  //           return null; // Filter out clusters that don't start with 'dino-test'
  //         }
  //       });
  
  //       const clusterStatuses = await Promise.all(clusterStatusPromises);
  //       allClusters.push(
  //         ...(clusterStatuses.filter((cluster) => cluster !== null) as { name: string; status: string; tasks: number }[])
  //       );
  
  //       nextToken = response.nextToken;
  //     } while (nextToken);
  
  //     console.log("Fetched clusters:", allClusters); // Add this line for debugging
  
  //     return allClusters;
  //   } catch (error) {
  //     console.error("Error listing clusters:", error);
  //     throw error;
  //   }
  // }
  
  // async listClustersWithStatus(): Promise<{ name: string; status: string; tasks: number }[]> {
  //   try {
  //     const allClusters: { name: string; status: string; tasks: number }[] = [];
  //     let nextToken: string | undefined = undefined;
  
  //     const maxResults = 100; // Adjust this value as needed
  //     const describeClustersBatchSize = 1; // Adjust this value based on concurrency limits
  
  //     do {
  //       const params: AWS.ECS.Types.ListClustersRequest = {
  //         maxResults,
  //         nextToken,
  //       };
  
  //       const response = await this.ecs.listClusters(params).promise();
  //       const clusterArns = response.clusterArns || [];
  
  //       const batchedClusterArns = [];
  //       for (let i = 0; i < clusterArns.length; i += describeClustersBatchSize) {
  //         const batchClusterArns = clusterArns.slice(i, i + describeClustersBatchSize);
  //         batchedClusterArns.push(batchClusterArns);
  //       }
  
  //       const clusterStatusPromises = batchedClusterArns.map(async (batchClusterArns) => {
  //         const batchPromises = batchClusterArns.map(async (arn) => {
  //           const clusterName = arn.split("/").pop() as string;
  
  //           if (clusterName.startsWith("dino-test") || clusterName.startsWith("Dino-test")) {
  //             const describeResponse = await this.ecs
  //               .describeClusters({ clusters: [clusterName] })
  //               .promise();
  
  //             const clusterStatus =
  //               describeResponse.clusters && describeResponse.clusters.length
  //                 ? describeResponse.clusters[0].status || "UNKNOWN"
  //                 : "UNKNOWN";
  
  //             const listTasksResponse = await this.ecs
  //               .listTasks({ cluster: clusterName })
  //               .promise();
  
  //             const taskCount = listTasksResponse.taskArns ? listTasksResponse.taskArns.length : 0;
  
  //             return { name: clusterName, status: clusterStatus, tasks: taskCount };
  //           } else {
  //             return null;
  //           }
  //         });
  
  //         return Promise.all(batchPromises);
  //       });
  
  //       const clusterStatuses = (await Promise.all(clusterStatusPromises)).flat(); // Flatten the array
  //       allClusters.push(
  //         ...(clusterStatuses.filter((cluster) => cluster !== null) as { name: string; status: string; tasks: number }[])
  //       );
  
  //       nextToken = response.nextToken;
  //     } while (nextToken);
  
  //     console.log("Fetched clusters:", allClusters); // Add this line for debugging
  
  //     return allClusters;
  //   } catch (error) {
  //     console.error("Error listing clusters:", error);
  //     throw error;
  //   }
  // }
  
  async listClustersWithStatus(): Promise<{ name: string; status: string; tasks: number }[]> {
    try {
      const allClusters: { name: string; status: string; tasks: number }[] = [];
  
      const maxResults = 100; // Adjust this value as needed
      const describeClustersBatchSize = 10; 
  
      let nextToken: string | undefined = undefined;
  
      do {
        const params: AWS.ECS.Types.ListClustersRequest = {
          maxResults,
          nextToken,
        };
  
        const response = await this.ecs.listClusters(params).promise();
        const clusterArns = response.clusterArns || [];
  
        // Batch the clusterArns for parallel processing
        const batchedClusterArns: string[][] = clusterArns.reduce<string[][]>((result, _, index, array) => {
          if (index % describeClustersBatchSize === 0) {
            result.push(array.slice(index, index + describeClustersBatchSize));
          }
          return result;
        }, []);
        
        
  
        // Process batches concurrently
        await Promise.all(
          batchedClusterArns.map(async (batchClusterArns) => {
            const batchPromises = batchClusterArns.map(async (arn) => {
              const clusterName = arn.split("/").pop() as string;
  
              if (clusterName.startsWith("dino-test") || clusterName.startsWith("Dino-test")) {
                const describeResponse = await this.ecs
                  .describeClusters({ clusters: [clusterName] })
                  .promise();
  
                const clusterStatus =
                  describeResponse.clusters && describeResponse.clusters.length
                    ? describeResponse.clusters[0].status || "UNKNOWN"
                    : "UNKNOWN";
  
                const listTasksResponse = await this.ecs
                  .listTasks({ cluster: clusterName })
                  .promise();
  
                const taskCount = listTasksResponse.taskArns ? listTasksResponse.taskArns.length : 0;
  
                return { name: clusterName, status: clusterStatus, tasks: taskCount };
              } else {
                return null;
              }
            });
  
            // Filter out null values and push to allClusters
            const batchResults = await Promise.all(batchPromises);
            allClusters.push(...(batchResults.filter((cluster) => cluster !== null) as { name: string; status: string; tasks: number }[]));
          })
        );
  
        // Check if there are more clusters to fetch
        nextToken = response.nextToken;
      } while (nextToken);
  
      console.log("Fetched clusters:", allClusters); // Add this line for debugging
  
      return allClusters;
    } catch (error) {
      console.error("Error listing clusters:", error);
      throw error;
    }
  }
  
  
  
  
  
}
