import React from 'react';
import './Charts.css';

// Bar Chart Component
export function BarChart({ data, title, xKey, yKey, color = "#556B2F" }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p className="no-data">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item[yKey] || 0));
  const chartHeight = 250;
  const barWidth = Math.max(40, (100 / data.length) - 2);

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-wrapper">
        <svg width="100%" height={chartHeight} className="bar-chart">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item[yKey] || 0) / maxValue * (chartHeight - 60) : 0;
            const x = (index * (100 / data.length)) + 2;
            const y = chartHeight - 40 - barHeight;

            return (
              <g key={index}>
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${barWidth}%`}
                  height={barHeight}
                  fill={color}
                  rx="4"
                  className="bar"
                />
                <text
                  x={`${x + barWidth / 2}%`}
                  y={chartHeight - 20}
                  textAnchor="middle"
                  className="bar-label"
                  fontSize="12"
                >
                  {item[xKey]}
                </text>
                <text
                  x={`${x + barWidth / 2}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="bar-value"
                  fontSize="11"
                  fontWeight="600"
                >
                  {item[yKey]}
                </text>
              </g>
            );
          })}
          {/* Y-axis */}
          <line x1="5%" y1="20" x2="5%" y2={chartHeight - 40} stroke="#ddd" strokeWidth="2" />
          {/* X-axis */}
          <line x1="5%" y1={chartHeight - 40} x2="95%" y2={chartHeight - 40} stroke="#ddd" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

// Line Chart Component
export function LineChart({ data, title, xKey, yKey, color = "#3b82f6" }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p className="no-data">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item[yKey] || 0));
  const chartHeight = 250;
  const chartWidth = 800; // Fixed width for calculations
  const paddingLeft = chartWidth * 0.1; // 10% padding
  const paddingRight = chartWidth * 0.1;
  const paddingTop = 30;
  const paddingBottom = 40;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((item, index) => {
    const xPercent = data.length > 1 ? index / (data.length - 1) : 0.5;
    const x = paddingLeft + (xPercent * plotWidth);
    const yValue = item[yKey] || 0;
    const yPercent = maxValue > 0 ? yValue / maxValue : 0;
    const y = paddingTop + plotHeight - (yPercent * plotHeight);
    return { x, y, label: item[xKey], value: item[yKey], xPercent };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const areaPathData = pathData + 
    ` L ${points[points.length - 1].x} ${paddingTop + plotHeight}` +
    ` L ${points[0].x} ${paddingTop + plotHeight} Z`;

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-wrapper">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="line-chart">
          {/* Area fill */}
          <path
            d={areaPathData}
            fill={color}
            fillOpacity="0.2"
            className="area-fill"
          />
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            className="line-path"
          />
          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="line-point"
              />
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                className="point-value"
                fontSize="10"
                fontWeight="600"
              >
                {point.value}
              </text>
            </g>
          ))}
          {/* Y-axis */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + plotHeight} stroke="#ddd" strokeWidth="2" />
          {/* X-axis */}
          <line x1={paddingLeft} y1={paddingTop + plotHeight} x2={paddingLeft + plotWidth} y2={paddingTop + plotHeight} stroke="#ddd" strokeWidth="2" />
          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartHeight - 20}
              textAnchor="middle"
              className="axis-label"
              fontSize="11"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// Timeline Component
export function Timeline({ events, title }) {
  if (!events || events.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p className="no-data">No events available</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="timeline-wrapper">
        <div className="timeline-line"></div>
        {events.map((event, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">{event.date}</div>
              <div className="timeline-title">{event.title}</div>
              {event.description && (
                <div className="timeline-description">{event.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie Chart Component
export function PieChart({ data, title, valueKey, labelKey, colors = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p className="no-data">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  const chartSize = 200;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = chartSize / 2 - 20;

  let currentAngle = -Math.PI / 2; // Start from top

  const slices = data.map((item, index) => {
    const value = item[valueKey] || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const angle = (value / total) * 2 * Math.PI;

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Calculate path for slice
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle = endAngle;

    return {
      pathData,
      color: colors[index % colors.length],
      label: item[labelKey],
      value,
      percentage: Math.round(percentage)
    };
  });

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-wrapper">
        <div className="pie-chart-container">
          <svg width={chartSize} height={chartSize} className="pie-chart">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="pie-slice"
              />
            ))}
          </svg>
          <div className="pie-center-text">
            <div className="pie-total">{total}</div>
            <div className="pie-label">Total</div>
          </div>
        </div>
        <div className="pie-legend">
          {slices.map((slice, index) => (
            <div key={index} className="pie-legend-item">
              <div
                className="pie-legend-color"
                style={{ backgroundColor: slice.color }}
              ></div>
              <div className="pie-legend-text">
                <div className="pie-legend-label">{slice.label}</div>
                <div className="pie-legend-value">{slice.value} ({slice.percentage}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

