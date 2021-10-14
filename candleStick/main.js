const CANDLE_URL = "https://jp7ymdkf7jcz5hni62kofoxapm.appsync-api.ap-southeast-1.amazonaws.com/graphql";
const CANDLE_API_KEY = "da2-nomuqr6n7bhojod5loycz3uvfa";
const INSURANCE_FUND_ABI = ["function getAllAmms() view returns (address[])"];
const AMM_READER_ABI = [
  "function getAmmStates(address _amm) view returns (tuple(" +
    "uint256 quoteAssetReserve, " +
    "uint256 baseAssetReserve, " +
    "uint256 tradeLimitRatio, " +
    "uint256 fundingPeriod, " +
    "string quoteAssetSymbol, " +
    "string baseAssetSymbol, " +
    "bytes32 priceFeedKey, " +
    "address priceFeed) amm)",
];

function convertToData(sticks) {
  return sticks
    .sort((a, b) => a.startTime - b.startTime)
    .map(({ startTime, open, high, low, close, txCount }) => {
      if (txCount > 0) {
        return {
          time: startTime,
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
        };
      } else {
        return {
          time: startTime,
        };
      }
    });
}

async function fetchCandle(ammAddress, resolution) {
  const result = await fetch(CANDLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": CANDLE_API_KEY,
    },
    body: JSON.stringify({
      query: `
        query {
            listCandleSticks(query: {
                marketResolution: { eq: "${ammAddress}#${resolution}" }
            }, limit: 500) {
                items {
                    market
                    resolution
                    startTime
                    open
                    high
                    low
                    close
                    volume
                    txCount
                }
            }
        }
            `,
    }),
  }).then((res) => res.json());

  return result.data.listCandleSticks.items;
}

async function fetchAmms() {
  const metadata = await fetch("https://metadata.perp.exchange/production.json").then((res) => res.json());
  const insuranceFundAddr = metadata.layers.layer2.contracts.InsuranceFund.address;
  const ammReaderAddr = metadata.layers.layer2.contracts.AmmReader.address;
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.xdaichain.com/");
  const insuranceFund = new ethers.Contract(insuranceFundAddr, INSURANCE_FUND_ABI, provider);
  const ammReader = new ethers.Contract(ammReaderAddr, AMM_READER_ABI, provider);
  const ammAddresses = await insuranceFund.getAllAmms();
  const result = await Promise.all(ammAddresses.map((addr) => ammReader.getAmmStates(addr)));
  const amms = result.map((amm, index) => ({
    ...amm,
    address: ammAddresses[index],
  }));
  return amms;
}

function setupCandlestick() {
  const chart = LightweightCharts.createChart(document.getElementById("candlestick"), {
    width: 800,
    height: 600,
  });
  return chart.addCandlestickSeries();
}

function setupAmmSelect(amms) {
  const ammsElement = document.getElementById("amm-select");
  ammsElement.innerHTML = amms
    .map((amm) => `<option value="${amm.address}">${amm.baseAssetSymbol}/${amm.quoteAssetSymbol}</option>`)
    .join("\n");
  return ammsElement;
}

function setupResolutionSelect(resolutions) {
  const resElement = document.getElementById("resolution-select");
  resElement.innerHTML = resolutions.map((res) => `<option value="${res}">${res}</option>`).join("\n");
  return resElement;
}

async function updateCandle(ammAddress, resolution, candleSeries) {
  const result = await fetchCandle(ammAddress, resolution);
  const data = convertToData(result);
  candleSeries.setData(data);
}

async function main() {
  const amms = await fetchAmms();
  const candleSeries = setupCandlestick();
  const resolutions = ["5m", "1h", "1d"];
  let resolutionIndex = 0;
  let ammIndex = 0;

  const ammElement = setupAmmSelect(amms, candleSeries);
  const resElement = setupResolutionSelect(resolutions);

  ammElement.addEventListener("change", ({ target }) => {
    ammIndex = target.selectedIndex;
    updateCandle(amms[ammIndex].address, resolutions[resolutionIndex], candleSeries);
  });

  resElement.addEventListener("change", ({ target }) => {
    resolutionIndex = target.selectedIndex;
    updateCandle(amms[ammIndex].address, resolutions[resolutionIndex], candleSeries);
  });

  updateCandle(amms[ammIndex].address, resolutions[resolutionIndex], candleSeries);
}

main();
