import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as AWS from 'aws-sdk'; // Import AWS SDK

@Component({
  selector: 'app-button-list',
  templateUrl: './button-list.component.html',
  styleUrls: ['./button-list.component.scss']
})
export class ButtonListComponent {
  @Input() buttonContent: string;
  @Input() cluster!: { name: string; status: string, tasks: number, asgName?: string };
  @Output() startClusterClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() stopClusterClicked: EventEmitter<void> = new EventEmitter<void>();
  state: boolean = false;
  prevState: boolean | null = null;
  clickedButton: string = 'not-started';
  loader: boolean = false;

  // Create an AWS Auto Scaling instance
  private asg: AWS.AutoScaling;

  constructor() {
    this.buttonContent = '';

    // Initialize the AWS Auto Scaling service
    this.asg = new AWS.AutoScaling({
      region: 'us-east-1' // Replace with your AWS region
    });
  }

  ngOnInit() {
    // Initial status check based on ASG desired capacity
    this.checkClusterStatus();
    console.log("Button: ", this.cluster)
  }

  async checkClusterStatus() {
    try {
      // Replace with your Auto Scaling Group name
      if(this.cluster.asgName) {
        const asgName = this.cluster.asgName;

        // Describe the Auto Scaling Group
        const asgResponse = await this.asg.describeAutoScalingGroups({ AutoScalingGroupNames: [asgName] }).promise();
        const asgDetails = asgResponse.AutoScalingGroups[0]; // Assuming there's only one ASG with the given name
        // Get the desired capacity from ASG details
        const desiredCapacity = asgDetails.DesiredCapacity || 0;
        // Update the cluster status based on ASG desired capacity
        if (desiredCapacity > 0) {
          this.cluster.status = 'ACTIVE';
        } else {
          this.cluster.status = 'NOT_STARTED';
        }
      }
    } catch (error) {
      console.error('Error checking cluster status:', error);
      throw error;
    }
  }

  startClicked() {
    if (this.cluster.status === 'NOT_STARTED') {
      // Trigger start action only if the ASG desired capacity is 0 (cluster not started)
      this.startClusterClicked.emit();
      console.log('Clicked on start');
    }
  }
  
  stopClicked() {
    if (this.cluster.status === 'ACTIVE') {
      // Trigger stop action only if the ASG desired capacity is greater than 0 (cluster active)
      this.stopClusterClicked.emit();
      console.log('Clicked on stop');
    }
  }
}
