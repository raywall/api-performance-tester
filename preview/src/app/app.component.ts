import { parseISO, format } from 'date-fns';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PerformanceDataService } from './services/performance-data.service';
import { PerformanceReport } from './core/models/performance-report.model';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { formatDateTime, formatDuration } from './core/utils/date-time.utils';
import { ptBR } from 'date-fns/locale';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'Performance Dashboard';
  performanceReport: PerformanceReport | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Pie Chart
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: 10,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            if (context.raw !== undefined) {
              return `${label}: ${context.raw} (${(context.raw as number / (this.performanceReport?.result.totalRequests || 1) * 100).toFixed(2)}%)`;
            }
            return label;
          }
        }
      }
    }
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Requisições OK', 'Requisições com Erro'],
    datasets: [{
      data: []
    }]
  };

  public pieChartType: ChartType = 'pie';

  // Line Chart - Requests per Second
  public rpsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'dd/MM/yyyy HH:mm:ss',
          unit: 'second'
        },
        title: {
          display: true,
          text: 'Tempo'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Requisições por Segundo (RPS)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return formatDateTime(new Date(tooltipItems[0].parsed.x).toISOString());
          },
          label: (context) => {
            const dataPoint = context.raw as { x: number, y: number };
            return `RPS: ${dataPoint.y} (${context.dataset.label})`;
          }
        }
      }
    }
  };
  
  public rpsChartData: ChartData<'line'> = {
    datasets: []
  };
  
  public rpsChartType: ChartType = 'line';

  // Line Chart - Response Time
  public responseTimeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'dd/MM/yyyy HH:mm:ss',
          unit: 'second'
        },
        title: {
          display: true,
          text: 'Tempo'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tempo de Resposta (ms)'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return formatDateTime(new Date(tooltipItems[0].parsed.x).toISOString()); 
          },
          label: (context) => {
            const dataPoint = context.raw as { x: number, y: number }; 
            return `Tempo: ${dataPoint.y}ms`;
          }
        }
      }
    }
  };
  
  public responseTimeChartData: ChartData<'line'> = {
    datasets: []
  };
  
  public responseTimeChartType: ChartType = 'line';

  constructor(private performanceDataService: PerformanceDataService) { }

  ngOnInit(): void {
    this.performanceDataService.performanceReport$.subscribe(report => {
      this.performanceReport = report;
      this.updateCharts(report);
      this.isLoading = false;
      this.errorMessage = null;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isLoading = true;
      this.errorMessage = null;
      const file = input.files[0];
      this.performanceDataService.loadJsonFile(file)
        .catch(error => {
          this.errorMessage = error;
          this.isLoading = false;
        });
    }
  }

  updateCharts(report: PerformanceReport): void {
    const chartData = this.performanceDataService.getChartData(report);

    // Update Pie Chart
    this.pieChartData.datasets[0].data = chartData.pieChartData;
    this.chart?.update();

    // Update RPS Chart
    const rpsSuccessData = chartData.requestsPerSecondData.filter(d => d.status === 'success').map(d => ({ x: d.x, y: d.y }));
    const rpsFailedData = chartData.requestsPerSecondData.filter(d => d.status === 'failed').map(d => ({ x: d.x, y: d.y }));

    this.rpsChartData.datasets = [
      { data: rpsSuccessData, label: 'OK', borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,0.2)', fill: false, pointRadius: 0 },
      { data: rpsFailedData, label: 'Erro', borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.2)', fill: false, pointRadius: 0 }
    ];
    // this.chart?.update();

    // Update Response Time Chart
    this.responseTimeChartData.datasets = [
      { data: chartData.responseTimeData.map(d => ({ x: d.x, y: d.y })), label: 'Tempo de Resposta (OK)', borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', fill: false, pointRadius: 0 }
    ];
    this.chart?.update();
  }

  // Helpers para o template
  formatDurationDisplay(duration: string): string {
    return formatDuration(duration);
  }

  formatDateTimeDisplay(isoString: string | undefined): string { 
    if (!isoString) {
      return 'N/A';
    }
    try {
      const date = parseISO(isoString);
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch (e) {
      console.error('Error formatting date:', isoString, e);
      return 'N/A';
    }
  }

  getExecutionDuration(): string {
    if (!this.performanceReport || !this.performanceReport.result || this.performanceReport.result.requests.length === 0) {
        return 'N/A';
    }
  
    const sortedRequests = [...this.performanceReport.result.requests].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (sortedRequests.length === 0) {
        return 'N/A';
    }
    const firstTimestamp = new Date(sortedRequests[0].timestamp).getTime();
    const lastTimestamp = new Date(sortedRequests[sortedRequests.length - 1].timestamp).getTime();
    const durationMs = lastTimestamp - firstTimestamp;

    return formatDuration(`${durationMs}ms`);
  }
}