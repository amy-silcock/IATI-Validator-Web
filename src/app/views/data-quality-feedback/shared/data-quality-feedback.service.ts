import { Organisation } from './../../../organisation/shared/organisation';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import 'rxjs/add/observable/of';

import { environment } from './../../../../environments/environment';
import { LogService } from '../../../core/logging/log.service';
import { Source } from './source';
import { Severity } from './severity';
import { Feedback, Dqfs, Activity } from './feedback';
import { IatiDataset } from './../../../organisation/shared/iati-dataset';
import { ReportInfo } from './report-info';


@Injectable()
export class DataQualityFeedbackService  {
  // private urlApiOrganisation: string = environment.apiDataworkBench + '/iati-publishers';
  private urlApis: string = environment.apiBaseUrl + '/dqfs';
  private urlApiIatiFile: string = environment.apiDataworkBench + '/iati-files';
  private urlApiIatiDataSet: string = environment.apiDataworkBench + '/iati-datasets';
  private urlApiOrganisation: string = environment.apiDataworkBench + '/iati-publishers';

  constructor(private http: HttpClient,
              private logger: LogService) { }



  getDqf(id: string): Observable<Dqfs> {
    const url: string = this.urlApis + '/' + name + id;
    this.logger.debug(url);

    return this.http.get<Dqfs>(url).pipe(
      tap(_ => this.logger.debug(`fetched dqfs id=${id}`)),
      catchError(this.handleError<Dqfs>(`getDqf id=${id}`))
    );
  }

  getActivities(md5: string): Observable<Dqfs> {
    const container = 'dataworkbench-json';
    const url: string = this.urlApiIatiFile + '/' + container + '/download/' + md5 + '.json';
    //   /iati-files/{container}/download/{file}
    return this.http.get<any>(url)
    .pipe(
      // tap(_ => this.log(`fetched iati file`)),
      catchError(this.handleError('getIatiFile', undefined ))
    );
  }

  getReportInfo(md5: string): Observable<ReportInfo> {
    const  reportInfo: ReportInfo = {organisationName: '', fileName: '', organisationSlug: '' };

    const url: string = this.urlApiIatiDataSet + '/findOne/' + '?filter[where][md5]=' + md5;
    this.http.get<IatiDataset>(url)
      .subscribe(
        data => {
          reportInfo.fileName = data.filename;
          reportInfo.organisationSlug = data.publisher;
          const urlPublisher: string = this.urlApiOrganisation + '/findOne/' + '?filter[where][slug]=' + data.publisher;
          this.http.get<Organisation>(urlPublisher)
            .subscribe(
              datas => {
                reportInfo.organisationName = datas.name;
                return Observable.of(reportInfo);
              }
            );
        }
      );
      return Observable.of(reportInfo);
  }



  getSeverities(): Severity[] {
    return [
      { id:  'error', slug: 'danger' , name: 'Errors', count: null, order: 1, show: true, types: []},
      { id:  'warning', slug: 'warning' , name: 'Warnings', count: null,  order: 2, show: true, types: []},
      { id:  'improvement', slug: 'info' , name: 'Improvements', count: null, order: 3,  show: true, types: []},
      { id:  'optimisation', slug: 'success' , name: 'Optimisations', count: null, order: 4, show: true, types: []},
    ];
  }

  getSources(): Source[] {
    return [
      { id:  'practice', slug: 'practice' , name: 'Common practice', count: null, order: 1, show: true},
      { id:  'iati', slug: 'iati' , name: 'IATI', count: null,  order: 2, show: true},
      { id:  'iati-doc', slug: 'iati-doc' , name: 'IATI documentation', count: null, order: 3,  show: true},
      { id:  'minbuza', slug: 'minbuza' , name: 'Ministery of foreign affairs The Netherlands', count: null, order: 4, show: true},
    ];
  }




  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging
      this.logger.error(error);
      // console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
