import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as AWS from 'aws-sdk';

@Injectable({
  providedIn: 'root',
})
export class AwsService {
  constructor() {
    // Configure AWS SDK with credentials
    AWS.config.update({
      accessKeyId: environment.awsAccessKeyId,
      secretAccessKey: environment.awsSecretAccessKey,
    });
  }

  // Add methods for AWS operations here
}
