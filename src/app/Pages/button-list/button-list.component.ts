import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-list',
  templateUrl: './button-list.component.html',
  styleUrls: ['./button-list.component.scss']
})
export class ButtonListComponent {
  @Input() buttonContent: string;
  @Input() cluster!: { name: string; status: string, tasks: number };
  state: boolean = false;
  prevState: boolean | null = null;
  clickedButton: string = 'not-started';

  ngOnInit() {
    // console.log("cluster in button ", this.cluster);
  }

  startClicked() {
    this.prevState = this.state;
    this.state = true;
    this.clickedButton = 'start';
  }
  
  stopClicked() {
    this.prevState = this.state;
    this.state = false;
    this.clickedButton = 'stop';
  }
  
  constructor() {
    this.buttonContent = ''; 
    // console.log("cluster in button ", this.cluster)
  }
}
