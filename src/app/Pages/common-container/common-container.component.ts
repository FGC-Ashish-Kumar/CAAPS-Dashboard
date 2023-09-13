import { Component, OnInit } from '@angular/core';
import { AwsService } from '../../aws.service';
import { ClusterService } from 'src/app/cluster.service';

@Component({
  selector: 'app-common-container',
  templateUrl: './common-container.component.html',
  styleUrls: ['./common-container.component.scss']
})
export class CommonContainerComponent implements OnInit {
  clusters: { name: string; status: string; tasks: number; asgName?: string }[] = [];

  constructor(private clusterService: ClusterService, private awsService: AwsService) {}

  ngOnInit(): void {
    // Fetch and display the list of clusters on component initialization
    this.fetchClusters();
    console.log("Clusters Data", this.clusters)
  }

  async fetchClusters(): Promise<void> {
    try {
      const clusters = await this.clusterService.listClustersWithStatus();
      // Fetch ASG names for each cluster
      for (const cluster of clusters) {
        const asgName = await this.clusterService.getASGNameForCluster(cluster.name);
        cluster.asgName = asgName || ''; // Set to empty string if asgName is falsy
      }

      this.clusters = clusters;
    } catch (error) {
      console.error('Error fetching clusters:', error);
    }
  }

  calculateCardWidth(): string {
    const numCardsPerRow = 5;
    const flexBasisPercentage = 100 / numCardsPerRow;
    return `${flexBasisPercentage}%`;
  }

  handleStartClusterClick(cluster: { name: string; status: string; tasks: number; asgName?: string; }): void {
    if (cluster.asgName !== undefined) {
      // Handle starting the cluster here
      this.clusterService.startCluster(cluster.name)
        .then(() => {
          console.log(`Started cluster: ${cluster.name}`);
          window.location.reload();
          // Handle success if needed, e.g., show a success message or update the UI
        })
        .catch(error => {
          console.error(`Error starting cluster ${cluster.name}:`, error);
          // Handle error if needed, e.g., show an error message or take appropriate action
        });
    } else {
      alert(`ASG name is undefined for cluster: ${cluster.name}`);
    }
  }

  handleStopClusterClick(cluster: { name: string; status: string; tasks: number; asgName?: string; }): void {
    if (cluster.asgName !== undefined) {
      // Handle stopping the cluster here
      this.clusterService.stopCluster(cluster.name)
        .then(() => {
          console.log(`Stopped cluster: ${cluster.name}`);
          window.location.reload();
          // Handle success if needed, e.g., show a success message or update the UI
        })
        .catch(error => {
          console.error(`Error stopping cluster ${cluster.name}:`, error);
          // Handle error if needed, e.g., show an error message or take appropriate action
        });
    } else {
      console.error(`ASG name is undefined for cluster: ${cluster.name}`);
    }
  }
}
