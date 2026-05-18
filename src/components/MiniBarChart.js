import React from 'react';

import ReactApexChart from 'react-apexcharts';

function MiniBarChart({
  data = [],
  data1 = [],
  data2 = [],
  color = '#4338CA',
  label = 'Chart',
  label1 = 'Revenue',
  label2 = 'Appointments',
}) {
  const chartData =
    Array.isArray(data) && data.length
      ? data.map((item) =>
          Number(item?.originalValue ?? item?.count ?? item?.total ?? item?.value ?? 0)
        )
      : [0, 0, 0, 0, 0, 0, 0];

  const series =
    data1.length || data2.length
      ? [
          {
            name: label1 || 'Revenue',
            data: data1,
          },

          {
            name: label2 || 'Appointments',

            data: data2,
          },
        ]
      : [
          {
            name: label || 'Chart',

            data: chartData,
          },
        ];

  const options = {
    chart: {
      type: 'area',

      sparkline: {
        enabled: true,
      },

      toolbar: {
        show: false,
      },

      zoom: {
        enabled: false,
      },
    },

    stroke: {
      curve: 'smooth',

      width: 3,
    },

    fill: {
      type: 'gradient',

      gradient: {
        shadeIntensity: 1,

        opacityFrom: 0.4,

        opacityTo: 0.05,

        stops: [0, 100],
      },
    },

    colors: [color],

    dataLabels: {
      enabled: false,
    },

    tooltip: {
      enabled: true,
    },

    grid: {
      show: false,
    },

    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

      labels: {
        show: false,
      },

      axisBorder: {
        show: false,
      },

      axisTicks: {
        show: false,
      },
    },

    yaxis: {
      show: false,
    },
  };

  return <ReactApexChart options={options} series={series} type="area" width={120} height={70} />;
}

export default MiniBarChart;
