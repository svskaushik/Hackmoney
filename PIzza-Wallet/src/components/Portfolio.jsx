import { useEffect, useState } from "react";
import { useChain, useMoralis } from "react-moralis";
import { Spin } from "antd";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

function getGradient(ctx, chartArea, data, scales) {
  const { bottom } = chartArea;
  const { y } = scales;
  const gradientBorder = ctx.createLinearGradient(0, 0, 0, bottom);
  const shift = y.getPixelForValue(data.datasets[0].data[0]) / bottom;
  if (shift && shift > 0 && shift < 1) {
    gradientBorder.addColorStop(0, "rgba(75, 192, 192, 1)");
    gradientBorder.addColorStop(shift, "rgba(75, 192, 192, 1)");
    gradientBorder.addColorStop(shift, "rgba(255, 26, 104, 1)");
    gradientBorder.addColorStop(1, "rgba(255, 26, 104, 1)");
  }
  return gradientBorder;
}

function belowGradient(ctx, chartArea, data, scales) {
  const { bottom } = chartArea;
  const { y } = scales;
  const gradientBackground = ctx.createLinearGradient(
    0,
    y.getPixelForValue(data.datasets[0].data[0]),
    0,
    bottom,
  );
  gradientBackground.addColorStop(0, "rgba(255, 26, 104, 0.01)");
  gradientBackground.addColorStop(1, "rgba(255, 26, 104, 0.7)");
  return gradientBackground;
}

function aboveGradient(ctx, chartArea, data, scales) {
  const { top } = chartArea;
  const { y } = scales;
  const gradientBackground = ctx.createLinearGradient(
    0,
    y.getPixelForValue(data.datasets[0].data[0]),
    0,
    top,
  );
  gradientBackground.addColorStop(0, "rgba(75, 192, 192, 0.01)");
  gradientBackground.addColorStop(1, "rgba(75, 192, 192, 0.7)");
  return gradientBackground;
}

const Portfolio = () => {
  const { Moralis, account } = useMoralis();
  const { chain } = useChain();

  Moralis.initPlugins();
  const covalent = Moralis.Plugins.covalent;

  let [timeStamps, setTimeStamps] = useState([]);
  let [value, setValue] = useState([]);
  let [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chain && account) {
      const fetch = async () => {
        setIsLoading(true);
        let res = await covalent.getHistoricalPortfolioValueOverTime({
          chainId: chain.networkId,
          address: account,
        });

        let _value = [];
        let _timeStamps = [];

        if (res) {
          res.data.items.map(function (index) {
            // console.log(
            //   index.contract_name,
            //   index.holdings.map(function (e) {
            //     return e.close.quote;
            //   }),
            // );
            index.holdings.map(function (e, index) {
              if (e.close.quote >= 0.01) {
                _value[index] > 0
                  ? (_value[index] += e.close.quote)
                  : (_value[index] = e.close.quote);
              }
            });
          });

          _timeStamps = res.data.items[0].holdings.map(function (index) {
            return new Date(index.timestamp).toISOString().slice(0, 10);
          });
        }

        setTimeStamps(_timeStamps.reverse());
        setValue(_value.reverse());
        setIsLoading(false);
        // console.log(res, value, _value);
      };

      fetch();
    }
  }, [account, chain]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <div className="fade">
      <div>
        <Line
          data={{
            labels: timeStamps,
            datasets: [
              {
                label: "Portfolio Value",
                data: value,
                pointRadius: 0.1,
                pointHitRadius: 100,
                tension: 0.5,
                parsing: {
                  yAxisKey: "0",
                },
                // backgroundColor: ["rgba(0, 99, 232, 0.6)"],
                borderColor: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea, data, scales } = chart;
                  if (!chartArea) {
                    return null;
                  }
                  return getGradient(ctx, chartArea, data, scales);
                },
                showLine: "true",
                fill: {
                  target: {
                    value: value[0],
                  },
                  above: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea, data, scales } = chart;
                    if (!chartArea) {
                      return null;
                    }
                    return aboveGradient(ctx, chartArea, data, scales);
                  },
                  below: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea, data, scales } = chart;
                    if (!chartArea) {
                      return null;
                    }
                    return belowGradient(ctx, chartArea, data, scales);
                  },
                },
              },
            ],
          }}
          height={200}
          width={200}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Portfolio Value $ ${
                  value[value.length - 1]?.toFixed(2) || "(no values found)"
                }`,
                color: "#fff",
              },
            },
            scales: {
              x: { display: false },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Portfolio;
