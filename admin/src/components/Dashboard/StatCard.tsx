import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isUp: boolean;
    comparisonText?: string;
  };
  showChart?: boolean;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, showChart = false, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-title">
          {icon && <span className="stat-icon mr-2">{icon}</span>}
          {title}
        </div>
        <span>···</span>
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`stat-trend ${trend.isUp ? 'trend-up' : 'trend-down'}`}>
          <span>{trend.isUp ? '↑' : '↓'} {trend.value}</span>
          {trend.comparisonText && <span>{trend.comparisonText}</span>}
        </div>
      )}
      {showChart && (
        <div className="stat-chart">
          <div className="chart-line">
            <div className="chart-point" style={{ height: '60%' }}></div>
            <div className="chart-point" style={{ height: '40%' }}></div>
            <div className="chart-point" style={{ height: '70%' }}></div>
            <div className="chart-point" style={{ height: '50%' }}></div>
            <div className="chart-point" style={{ height: '60%' }}></div>
            <div className="chart-point" style={{ height: '80%' }}></div>
            <div className="chart-point" style={{ height: '70%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
