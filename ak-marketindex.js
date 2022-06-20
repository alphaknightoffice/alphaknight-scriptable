const widget = new ListWidget();

const lanValue = initLanguage();

const { liquidationH24VolUsd, longRate, shortRate } = await fetchRow2Data();

const btcDominance = await fetchBtcDominanceData();

const { fearValue, fearText } = await fetchFngValue();

await createWidget();

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
  await widget.presentLarge();
}

widget.setPadding(0, 16, 0, 16);
widget.url = "https://twitter.com/alphaknightnft";

Script.setWidget(widget);
Script.complete();

// build the content of the widget
async function createWidget() {
  let background = new LinearGradient();
  background.locations = [0, 1];
  background.colors = [new Color("#81E0AA", 1), new Color("#FFFFFF", 0)];

  widget.backgroundGradient = background;

  const titleRow = widget.addStack();

  const coin = await getImage("ak-banner");
  const coinImg = titleRow.addImage(coin);
  coinImg.imageSize = new Size(159, 24);

  titleRow.addSpacer(null);

  const msg = titleRow.addText(lanValue.followUs);
  msg.textColor = new Color("#808080", 80);
  msg.font = Font.mediumRoundedSystemFont(11);

  widget.addSpacer(16);

  // row1
  const row1 = widget.addStack();

  // row1 -> card1
  const card1 = row1.addStack();
  card1.setPadding(20, 16, 20, 16);

  card1.backgroundColor = new Color("#FFFFFF");
  card1.cornerRadius = 12;

  const card1TextWrap = card1.addStack();
  card1TextWrap.layoutVertically();

  const greedIndexTitle = card1TextWrap.addText(lanValue.nftIndex);
  greedIndexTitle.textColor = new Color("#808080");
  greedIndexTitle.font = Font.regularSystemFont(12);

  card1TextWrap.addSpacer(4);

  const greedIndexRow = card1TextWrap.addStack();

  const greedIndexValue = greedIndexRow.addText(`${fearValue}`);
  greedIndexValue.textColor = new Color(fngColouring(fearValue));
  greedIndexValue.font = Font.semiboldSystemFont(15);

  greedIndexRow.addSpacer(null);

  const greedIndexText = greedIndexRow.addText(fearText);
  greedIndexText.textColor = new Color(fngColouring(fearValue));
  greedIndexText.font = Font.semiboldSystemFont(15);

  widget.addSpacer(12);

  // row2
  const row2 = widget.addStack();

  // row2 -> card2
  const card2 = row2.addStack();
  card2.setPadding(20, 16, 20, 0);
  card2.backgroundColor = new Color("#FFFFFF");
  card2.cornerRadius = 12;

  const card2TextWrap = card2.addStack();
  card2TextWrap.layoutVertically();

  const liquidationTitle = card2TextWrap.addText(lanValue.liquidation);
  liquidationTitle.textColor = new Color("#808080");
  liquidationTitle.font = Font.regularSystemFont(12);

  card2TextWrap.addSpacer(4);

  const liquidation = card2TextWrap.addText(
    `$${liquidationH24VolUsd.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")}`
  );
  liquidation.textColor = new Color("#000000");
  liquidation.font = Font.semiboldSystemFont(15);

  card2.addSpacer(null);

  row2.addSpacer(12);

  // row2 -> card2
  const card3 = row2.addStack();
  card3.setPadding(20, 16, 20, 0);
  card3.backgroundColor = new Color("#FFFFFF");
  card3.cornerRadius = 12;

  const card3TextWrap = card3.addStack();
  card3TextWrap.layoutVertically();

  const card3Title = card3TextWrap.addText(lanValue.longShort);
  card3Title.textColor = new Color("#808080");
  card3Title.font = Font.regularSystemFont(12);

  card3TextWrap.addSpacer(4);

  const card3Value = card3TextWrap.addText(`${longRate}%/${shortRate}%`);
  card3Value.textColor = new Color("#000000");
  card3Value.font = Font.semiboldSystemFont(14);

  card3.addSpacer(null);

  widget.addSpacer(12);

  // row3
  const row3 = widget.addStack();

  // row3 -> card4
  const card4 = row3.addStack();
  card4.setPadding(20, 16, 20, 16);
  card4.backgroundColor = new Color("#FFFFFF");
  card4.cornerRadius = 12;

  const card4TextWrap = card4.addStack();
  card4TextWrap.layoutVertically();

  const btcProportionTitle = card4TextWrap.addText(lanValue.btcDominance);
  btcProportionTitle.textColor = new Color("#808080");
  btcProportionTitle.font = Font.regularSystemFont(12);

  card4TextWrap.addSpacer(4);

  const btcProportionValue = card4TextWrap.addText(
    `${btcDominance.toFixed(2)}%`
  );
  btcProportionValue.textColor = new Color("#000000");
  btcProportionValue.font = Font.semiboldSystemFont(15);

  card4.addSpacer(null);
}

function fngColouring(indexValue) {
  let colorCode = "";
  if (indexValue >= 90) {
    colorCode = "#65c64c";
  }
  if (indexValue < 90) {
    colorCode = "#79d23c";
  }
  if (indexValue <= 75) {
    colorCode = "#9bbe44";
  }
  if (indexValue <= 63) {
    colorCode = "#c6bf22";
  }
  if (indexValue <= 54) {
    colorCode = "#dfce60";
  }
  if (indexValue <= 46) {
    colorCode = "#d8bc59";
  }
  if (indexValue <= 35) {
    colorCode = "#e39d64";
  }
  if (indexValue <= 25) {
    colorCode = "#d17339";
  }
  if (indexValue <= 10) {
    colorCode = "#b74d34";
  }

  return colorCode;
}

async function fetchFngValue() {
  const url = "https://api.alternative.me/fng/";
  const req = new Request(url);
  const apiResult = await req.loadJSON();

  const fearValue = apiResult.data[0].value;
  let fearText = apiResult.data[0].value_classification;

  switch (fearText) {
    case "Fear":
      fearText = lanValue.fear;
      break;
    case "Extreme Fear":
      fearText = lanValue.extremeFear;
      break;
    case "Greedy":
      fearText = lanValue.greedy;
      break;
    case "Extreme Greedy":
      fearText = lanValue.extremeGreedy;
      break;
  }

  return { fearValue, fearText };
}

async function fetchBtcDominanceData() {
  try {
    const date = getDate();
    const url = `https://api.coinmarketcap.com/data-api/v3/global-metrics/quotes/historical?format=chart_altcoin&interval=2d&timeStart=${date}`;
    const req = new Request(url);
    const apiResult = await req.loadJSON();
    const btcDominance = apiResult.data.quotes[0].btcDominance;

    return btcDominance;
  } catch (e) {
    return 0;
  }
}

async function fetchRow2Data() {
  try {
    const url = "https://fapi.coinglass.com/api/futures/home/statistics";
    const req = new Request(url);
    const apiResult = await req.loadJSON();
    const liquidationH24VolUsd =
      apiResult.data.liquidationH24VolUsd.toFixed(0) ?? 0;
    const longRate = apiResult.data.longRate ?? 0;
    const shortRate = apiResult.data.shortRate ?? 0;

    return { liquidationH24VolUsd, longRate, shortRate };
  } catch (e) {
    return { liquidationH24VolUsd: 0, longRate: 0, shortRate: 0 };
  }
}

async function getImage(image) {
  let fm = FileManager.local();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, image);
  if (fm.fileExists(path)) {
    return fm.readImage(path);
  } else {
    // download once
    let imageUrl;
    switch (image) {
      case "ak-banner":
        imageUrl =
          "https://raw.githubusercontent.com/EndureBlazePages/image/main/ak-mini-banner.png";
        break;
      default:
        console.log(`Sorry, couldn't find ${image}.`);
    }
    let iconImage = await loadImage(imageUrl);
    fm.writeImage(path, iconImage);
    return iconImage;
  }
}

async function loadImage(imgUrl) {
  const req = new Request(imgUrl);
  return await req.loadImage();
}

function getDate() {
  var date = new Date();
  var nowMonth = date.getMonth() + 1;
  var strDate = date.getDate();
  var seperator = "-";
  if (nowMonth >= 1 && nowMonth <= 9) {
    nowMonth = "0" + nowMonth;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var nowDate = date.getFullYear() + seperator + nowMonth + seperator + strDate;

  return nowDate;
}

function initLanguage() {
  const lan = Device.locale();
  let lanValue;

  const zh_CN = {
    followUs: "关注获取更多信息",
    nftIndex: "恐惧贪婪指数",
    liquidation: "爆仓总额 (24H)",
    longShort: "全网多/空比",
    btcDominance: "比特币市值占比",
    fear: "恐惧",
    extremeFear: "极端恐惧",
    greedy: "贪婪",
    extremeGreedy: "极端贪婪",
  };

  const en = {
    followUs: "Follow Us",
    nftIndex: "G-F Index",
    liquidation: "Liquidation (24H)",
    longShort: "Long/Short Ratio",
    btcDominance: "BTCMVRatio",
    fear: "Fear",
    extremeFear: "Extreme Fear",
    greedy: "Greedy",
    extremeGreedy: "Extreme Greedy",
  };

  if (lan === "zh_CN") {
    lanValue = zh_CN;
  } else {
    lanValue = en;
  }
  return { lanValue };
}

// end of script
