import { Component } from '@angular/core';

@Component({
  selector: 'app-common-container',
  templateUrl: './common-container.component.html',
  styleUrls: ['./common-container.component.scss']
})
export class CommonContainerComponent {
  buttonContents: string[] = ['ABIDEMANAGER', 'CURRENEXMODULE', 'EMAILMANAGER', 'EMSX', 'FILEPROCESS', 'FINANCINGMODULE', 'FXMODULE', 'GENEVAMODULE', 'JPMMODULE', 'MARKETAXESS', 'PAYMENTSMODULE', 'POSITION', 'REPORT', ' REPORTGENERATOR', 'RHUB', 'SCHEDULER', 'SECURITYMASTER', 'SFTPMODULE', 'SWIFT', 'SWIFTPARSER', 'TOMS', 'TRADEWEBDIRECT', 'TRADEWEBINST', 'TRAFIXCLIENT', 'TRAFIXMODULE', 'VCON', 'WATCHDOG'];

  calculateCardWidth(): string {
    const numCardsPerRow = 5;
    const flexBasisPercentage = 100 / numCardsPerRow;
    return `${flexBasisPercentage}%`;
}
}
