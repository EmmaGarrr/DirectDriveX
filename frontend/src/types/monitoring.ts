export interface SystemAlert {
  type: 'critical' | 'warning';
  category: string;
  message: string;
  timestamp: string;
}

export interface SystemHealth {
  cpu: { usage_percent: number };
  memory: { percent: number };
  disk: { percent: number };
  uptime: number;
}

export interface DatabasePerformance {
  stats: {
    collections: number;
    objects: number;
    db_size: number;
    index_size: number;
    avg_obj_size: number;
  };
  query_performance: {
    files_query_time_ms: number;
    users_query_time_ms: number;
  };
  current_operations: {
    count: number;
  };
}

export interface ApplicationMetrics {
  stats: {
    total_files: number;
    total_users: number;
    api_requests_24h: number;
    api_errors_24h: number;
  };
  top_endpoints: { endpoint: string; count: number }[];
  admin_activity: { admin: string; actions: number }[];
}