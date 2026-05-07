import React from "react";
import Chart from "react-apexcharts";

const StackedBarChart = ({
  appointments = [],
}) => {
  const groupedData = {};

  appointments.forEach((item) => {
    const date = new Date(
      item.createdAt
    ).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });

    if (!groupedData[date]) {
      groupedData[date] = {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        checkedin: 0,
      };
    }

    switch (item.status) {
      case "scheduled":
        groupedData[date].scheduled += 1;
        break;

      case "completed":
        groupedData[date].completed += 1;
        break;

      case "cancelled":
        groupedData[date].cancelled += 1;
        break;

      case "checked-in":
        groupedData[date].checkedin += 1;
        break;

      default:
        break;
    }
  });

  const categories =
    Object.keys(groupedData);

  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,

      toolbar: {
        show: true,
      },

      zoom: {
        enabled: true,
      },
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        borderRadiusApplication:
          "end",
        borderRadiusWhenStacked:
          "last",

        dataLabels: {
          total: {
            enabled: true,

            style: {
              fontSize: "13px",
              fontWeight: 900,
            },
          },
        },
      },
    },

    xaxis: {
      categories,
    },

    legend: {
      position: "right",
      offsetY: 40,
    },

    fill: {
      opacity: 1,
    },

    dataLabels: {
      enabled: true,
    },

    colors: [
      "#008FFB",
      "#00E396",
      "#FEB019",
      "#FF4560",
    ],
  };

  const series = [
    {
      name: "Scheduled",
      data: categories.map(
        (date) =>
          groupedData[date].scheduled
      ),
    },

    {
      name: "Completed",
      data: categories.map(
        (date) =>
          groupedData[date].completed
      ),
    },

    {
      name: "Checked In",
      data: categories.map(
        (date) =>
          groupedData[date].checkedin
      ),
    },

    {
      name: "Cancelled",
      data: categories.map(
        (date) =>
          groupedData[date].cancelled
      ),
    },
  ];

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={350}
    />
  );
};

export default StackedBarChart;