import { Component, OnInit } from '@angular/core';
import { AwsService } from '../../aws.service';
import { ClusterService } from 'src/app/cluster.service';

@Component({
  selector: 'app-common-container',
  templateUrl: './common-container.component.html',
  styleUrls: ['./common-container.component.scss']
})
export class CommonContainerComponent implements OnInit {
  // clusters: string[] = [];
  // clusters: { name: string; status: string };
  clusters: { name: string; status: string, tasks: number }[] = []; // Assuming clusters is an array of objects with name and status properties


  constructor(private clusterService: ClusterService, private awsService: AwsService) {
    this.clusters = [];
  }

  ngOnInit(): void {
    // Fetch and display the list of clusters on component initialization
    this.fetchClusters();
    console.log('clusters', this.clusters)
  }

  fetchClusters(): void {
    this.clusterService.listClustersWithStatus()
      .then(clusters => {
        this.clusters = clusters;
        // console.log('clusters', this.clusters);
      })
      .catch(error => {
        console.error('Error fetching clusters:', error);
      });
      console.log('clusters', this.clusters)
  }

  calculateCardWidth(): string {
    const numCardsPerRow = 5;
    const flexBasisPercentage = 100 / numCardsPerRow;
    return `${flexBasisPercentage}%`;
  }
}
