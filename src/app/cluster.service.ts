import { Injectable } from "@angular/core";
import * as AWS from "aws-sdk";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ClusterService {
  private ecs: AWS.ECS;
  private asg: AWS.AutoScaling;
  private ec2: AWS.EC2; 
  private asgNames: { [clusterName: string]: string | null } = {};
  private clusterDataCache: { [clusterName: string]: any } = {}; // Add a cache for cluster data
  private cacheUpdateTimeIntervalMs = 60000; // Update the cache every minute (adjust as needed)

  constructor() {
    // Initialize the AWS ECS service with the appropriate region
    AWS.config.update({
      accessKeyId: environment.awsAccessKeyId,
      secretAccessKey: environment.awsSecretAccessKey,
      region: "us-east-1", // Set your desired AWS region
    });

    // Create an ECS instance
    this.ecs = new AWS.ECS();
    this.asg = new AWS.AutoScaling();
    this.ec2 = new AWS.EC2();

    this.loadAsgNamesFromLocalStorage();
    this.loadClusterDataFromLocalStorage();

    setInterval(() => {
      this.loadAsgNamesFromLocalStorage();
      this.loadClusterDataFromLocalStorage();
    }, this.cacheUpdateTimeIntervalMs);
  }
  
  async listClustersWithStatus(): Promise<{ name: string; status: string; tasks: number; asgName: string }[]> {
    try {
      // Check if cluster data is already cached
      if (Object.keys(this.clusterDataCache).length > 0) {
        return Object.values(this.clusterDataCache);
      }
  
      const allClusters: { name: string; status: string; tasks: number; asgName: string }[] = [];
  
      const maxResults = 100; // Adjust this value as needed
      const describeClustersBatchSize = 40;
  
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
  
                const clusterData = { name: clusterName, status: clusterStatus, tasks: taskCount, asgName: '' };
                allClusters.push(clusterData);
  
                return clusterData;
              } else {
                return null;
              }
            });
  
            // Filter out null values
            const batchResults = await Promise.all(batchPromises);
  
            // Update the cache with the fetched data
            batchResults.forEach((clusterData) => {
              if (clusterData !== null) {
                this.clusterDataCache[clusterData.name] = clusterData;
              }
            });
          })
        );
  
        // Check if there are more clusters to fetch
        nextToken = response.nextToken;
      } while (nextToken);
  
      // Save the updated cache to local storage
      this.saveClusterDataToLocalStorage();
  
      console.log("Fetched clusters:", allClusters); // Add this line for debugging
  
      return allClusters;
    } catch (error) {
      console.error("Error listing clusters:", error);
      throw error;
    }
  }
  
  
  async getASGNameForCluster(clusterName: string): Promise<string | null> {
    try {
      // Check if ASG name is already stored
      if (this.asgNames[clusterName]) {
        return this.asgNames[clusterName];
      }
  
      const listContainerInstancesParams: AWS.ECS.Types.ListContainerInstancesRequest = {
        cluster: clusterName,
      };
  
      const listContainerInstancesResponse = await this.ecs
        .listContainerInstances(listContainerInstancesParams)
        .promise();
  
      if (listContainerInstancesResponse.containerInstanceArns) {
        const containerInstanceArns = listContainerInstancesResponse.containerInstanceArns;
  
        if (containerInstanceArns.length === 0) {
          console.log(`No container instances found for cluster ${clusterName}`);
          return null;
        }
  
        const describeContainerInstancesParams: AWS.ECS.Types.DescribeContainerInstancesRequest = {
          cluster: clusterName,
          containerInstances: containerInstanceArns,
        };
  
        const describeContainerInstancesResponse = await this.ecs
          .describeContainerInstances(describeContainerInstancesParams)
          .promise();
  
        if (describeContainerInstancesResponse.containerInstances) {
          const containerInstance = describeContainerInstancesResponse.containerInstances[0];
          const ec2InstanceId = containerInstance.ec2InstanceId;
  
          if (ec2InstanceId) {
            const describeInstancesParams: AWS.EC2.DescribeInstancesRequest = {
              InstanceIds: [ec2InstanceId],
            };
  
            const describeInstancesResponse = await this.ec2.describeInstances(describeInstancesParams).promise();
  
            if (
              describeInstancesResponse.Reservations &&
              describeInstancesResponse.Reservations.length > 0 &&
              describeInstancesResponse.Reservations[0].Instances &&
              describeInstancesResponse.Reservations[0].Instances.length > 0
            ) {
              const instance = describeInstancesResponse.Reservations[0].Instances[0];
              const asgName = instance.Tags?.find((tag) => tag.Key === "aws:autoscaling:groupName");
  
              if (asgName && asgName.Value) {
                console.log(`ASG name for cluster ${clusterName}: ${asgName.Value}`);
                this.asgNames[clusterName] = asgName.Value; // Store the ASG name in the map
                this.saveAsgNamesToLocalStorage(); 
                console.log("MAP val ", this.asgNames[clusterName])
                return asgName.Value;
              }
            }
          }
        }
      }
  
      console.error(`ASG name is not available for cluster ${clusterName}.`);
      this.asgNames[clusterName] = null; 
      return null;
    } catch (error) {
      console.error(`Error getting ASG name for cluster ${clusterName}:`, error);
      throw error;
    }
  }
  

  // Add a method to save cluster data to local storage
  private saveClusterDataToLocalStorage() {
    localStorage.setItem("clusterData", JSON.stringify(this.clusterDataCache));
  }

  private loadClusterDataFromLocalStorage() {
    const storedClusterData = localStorage.getItem("clusterData");
    if (storedClusterData) {
      this.clusterDataCache = JSON.parse(storedClusterData);
    }
  }
  
  private saveAsgNamesToLocalStorage() {
    localStorage.setItem("asgNames", JSON.stringify(this.asgNames));
  }

  private loadAsgNamesFromLocalStorage() {
    const storedAsgNames = localStorage.getItem("asgNames");
    if (storedAsgNames) {
      this.asgNames = JSON.parse(storedAsgNames);
    }
  }

  printAsgNamesMap() {
    console.log("ASG Names Map:", this.asgNames);
  }

  async startCluster(clusterName: string): Promise<void> {
    try {
      // Fetch the ASG name from the map using the clusterName
      const asgName = this.asgNames[clusterName];
      console.log("ASG Names saved is ", asgName)
      if (!asgName) {
        console.error(`ASG name is not available for cluster ${clusterName}.`);
        return;
      }
  
      // Set the desired capacity, min, and max to 1 for the specified Auto Scaling Group
      await this.setASGCapacity(asgName, 1, 1, 1);
      console.log(`Cluster ${clusterName} started successfully.`);
    } catch (error) {
      console.error(`Error starting cluster ${clusterName}:`, error);
      throw error;
    }
  }
  
  

  async stopCluster(clusterName: string): Promise<void> {
    try {
      // Fetch the ASG name for the cluster
      const asgName = await this.getASGNameForCluster(clusterName);
      this.asgNames[clusterName] = asgName || '';
  
      if (!asgName) {
        console.error(`ASG name is not available for cluster ${clusterName}.`);
        return;
      }
  
      // Set the desired capacity, min, and max to 0, 0, 0 for the specified Auto Scaling Group
      await this.setASGCapacity(asgName, 0, 0, 0);
  
      console.log(`Cluster ${clusterName} stopped successfully.`);
    } catch (error) {
      console.error(`Error stopping cluster ${clusterName}:`, error);
      throw error;
    }
  }
  
  

  private async setASGCapacity(asgName: string, desiredCapacity: number, minCapacity: number, maxCapacity: number): Promise<void> {
    try {
      const params: AWS.AutoScaling.Types.UpdateAutoScalingGroupType = {
        AutoScalingGroupName: asgName,
        DesiredCapacity: desiredCapacity,
        MinSize: minCapacity,
        MaxSize: maxCapacity,
      };

      await this.asg.updateAutoScalingGroup(params).promise();
    } catch (error) {
      console.error(`Error setting Auto Scaling Group capacity:`, error);
      throw error;
    }
  }
  
  
}
