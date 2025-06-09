import { Injectable } from '@angular/core';
import { PerformanceReport, Request } from '../core/models/performance-report.model';
import { Observable, Subject } from 'rxjs';
import { formatDateTime, formatDuration } from '../core/utils/date-time.utils';
import { parseISO } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class PerformanceDataService {
  private performanceReportSource = new Subject<PerformanceReport>();
  performanceReport$ = this.performanceReportSource.asObservable();

  constructor() { }

  async loadJsonFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const report: PerformanceReport = JSON.parse(content);
          this.performanceReportSource.next(report);
          resolve();
        } catch (error) {
          console.error('Error parsing JSON:', error);
          reject('Failed to parse JSON file.');
        }
      };
      fileReader.onerror = (e) => {
        console.error('Error reading file:', e);
        reject('Failed to read file.');
      };
      fileReader.readAsText(file);
    });
  }

  // Helper para converter string de duração para milissegundos para gráficos
  convertDurationToMs(duration: string): number {
    if (duration.endsWith('ms')) {
      return parseFloat(duration.replace('ms', ''));
    } else if (duration.endsWith('µs')) {
      return parseFloat(duration.replace('µs', '')) / 1000;
    } else if (duration.endsWith('s')) {
      return parseFloat(duration.replace('s', '')) * 1000;
    }
    return 0;
  }

  getChartData(report: PerformanceReport) {
    const successRequests = report.result.requests.filter(req => req.status === 'success');
    const failedRequests = report.result.requests.filter(req => req.status === 'failed');

    const totalTimeMs = this.convertDurationToMs(report.result.totalTime);
    const firstRequestTimestamp = report.result.requests.reduce((min, r) => Math.min(min, new Date(r.timestamp).getTime()), Infinity);
    const lastRequestTimestamp = report.result.requests.reduce((max, r) => Math.max(max, new Date(r.timestamp).getTime()), 0);
    const executionDurationMs = lastRequestTimestamp - firstRequestTimestamp;

    // Calcular RPS ao longo do tempo
    const rpsData: { x: Date, y: number, status: string }[] = []; // Altere x para Date
    const responseTimeData: { x: Date, y: number }[] = []; // Altere x para Date

    const sortedRequests = [...report.result.requests].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedRequests.forEach(req => {
      const timestampDate = parseISO(req.timestamp); // Converta a string ISO para um objeto Date
      rpsData.push({
        x: timestampDate, // Use o objeto Date
        y: report.result.requestsPerSecond,
        status: req.status
      });

      if (req.status === 'success') {
        responseTimeData.push({
          x: timestampDate, // Use o objeto Date
          y: this.convertDurationToMs(req.duration)
        });
      }
    });

    return {
      pieChartData: [report.result.successRequests, report.result.failedRequests],
      requestsPerSecondData: rpsData,
      responseTimeData: responseTimeData,
      executionStart: report.result.requests.length > 0 ? formatDateTime(sortedRequests[0].timestamp) : 'N/A',
      executionDuration: formatDuration(`${executionDurationMs}ms`)
    };
  }
}