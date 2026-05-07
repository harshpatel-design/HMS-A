import React from 'react';
import ReactApexChart from 'react-apexcharts';

function MiniBarChart({ data = [], color = '#4338CA' }) {
  const series = [
    {
      data: data.map((item) => item.originalValue),
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
      enabled: false,
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
