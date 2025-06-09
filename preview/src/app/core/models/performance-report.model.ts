export interface TestConfig {
  numberOfUsers: number;
  requestsPerUser: number;
}

export interface Request {
  userPosition: number;
  userId: string;
  requestId: string;
  scenarioID: string;
  scenarioName: string;
  timestamp: string;
  duration: string;
  status: string;
  statusCode: number;
}

export interface Result {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  errorRate: number;
  totalTime: string;
  averageLatency: string;
  minLatency: string;
  maxLatency: string;
  requestsPerSecond: number;
  p50Latency: string;
  p75Latency: string;
  p90Latency: string;
  p95Latency: string;
  p99Latency: string;
  requests: Request[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  requestConfig: {
    baseUrl: string;
    route: string;
    method: string;
    headers: { [key: string]: string };
    payload: string;
  };
}

export interface PerformanceReport {
  id: string;
  squad: string;
  project: string;
  username: string;
  testConfig: TestConfig;
  scenarios: Scenario[];
  result: Result;
}