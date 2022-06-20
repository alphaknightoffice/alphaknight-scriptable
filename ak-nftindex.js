const widget = new ListWidget();

const { lanValue } = initLanguage();

const { nftIndex, nftBuyer, nftSeller, nftVolume } = await fetchNftData();

const top3Data = await fetchTop3Data();

const gasFeeData = await fetchGasFee();

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
  card1.backgroundColor = new Color("#FFFFFF");
  card1.setPadding(12, 16, 14, 0);
  card1.cornerRadius = 12;

  const card1TextWrap = card1.addStack();
  card1TextWrap.layoutVertically();

  const nftTitle = card1TextWrap.addText(lanValue.nftIndex);
  nftTitle.textColor = new Color("#808080", 80);
  nftTitle.font = Font.regularSystemFont(12);
  nftTitle.centerAlignText();

  card1TextWrap.addSpacer(4);

  const nft = card1TextWrap.addText(nftIndex.toString());
  nft.textColor = new Color(getNftTextColor(nftIndex));
  nft.font = Font.semiboldSystemFont(15);

  card1.addSpacer(null);

  row1.addSpacer(12);

  // row1 -> card2
  const card2 = row1.addStack();
  card2.backgroundColor = new Color("#FFFFFF");
  card2.setPadding(12, 16, 14, 0);
  card2.cornerRadius = 12;

  const card2TextWrap = card2.addStack();
  card2TextWrap.layoutVertically();

  const gasFeeTitle = card2TextWrap.addText("GAS fees");
  gasFeeTitle.textColor = new Color("#808080", 20);
  gasFeeTitle.font = Font.regularSystemFont(12);
  gasFeeTitle.centerAlignText();

  card2TextWrap.addSpacer(4);

  const gasFee = card2TextWrap.addText(
    `${(eval(gasFeeData).toString(10) / 1000000000).toFixed(1)} gwei`
  );
  gasFee.textColor = new Color("#000000");
  gasFee.font = Font.semiboldSystemFont(15);

  card2.addSpacer(null);

  widget.addSpacer(12);

  // row2
  const row2 = widget.addStack();

  // row2 -> card3
  const card3 = row2.addStack();
  card3.layoutVertically();
  card3.backgroundColor = new Color("#FFFFFF");
  card3.cornerRadius = 12;

  // row2 -> card3 -> card3Row1
  const card3Row1 = card3.addStack();
  card3Row1.setPadding(16, 16, 14, 0);

  const card3Row1TextWrap = card3Row1.addStack();
  card3Row1TextWrap.layoutVertically();

  const ethNftPriceTitle = card3Row1TextWrap.addText(lanValue.ethNftPrice);
  ethNftPriceTitle.textColor = new Color("#808080", 20);
  ethNftPriceTitle.font = Font.regularSystemFont(12);

  card3Row1TextWrap.addSpacer(4);

  const ethNftPrice = card3Row1TextWrap.addText(
    `$ ${(nftVolume / 1000000).toFixed(1).toString()}M`
  );
  ethNftPrice.textColor = new Color("#000000");
  ethNftPrice.font = Font.semiboldSystemFont(15);

  card3Row1.addSpacer(null);

  // row2 -> card3 -> card3Row2
  const card3Row2 = card3.addStack();
  card3Row2.setPadding(12, 16, 14, 0);

  const card3Row2TextWrap = card3Row2.addStack();
  card3Row2TextWrap.layoutVertically();

  const ethNftPersonTitle = card3Row2TextWrap.addText(lanValue.ethNftPerson);
  ethNftPersonTitle.textColor = new Color("#808080", 20);
  ethNftPersonTitle.font = Font.regularSystemFont(12);

  card3Row2TextWrap.addSpacer(4);

  const ethNftPersonRow = card3Row2TextWrap.addStack();

  const ethNftPersonBuyer = ethNftPersonRow.addText(
    `${nftBuyer.toString()} Buyer`
  );
  ethNftPersonBuyer.textColor = new Color("#000000");
  ethNftPersonBuyer.font = Font.semiboldSystemFont(15);

  ethNftPersonRow.addSpacer(null);

  const ethNftPersonSeller = ethNftPersonRow.addText(
    `${nftSeller.toString()} Seller`
  );
  ethNftPersonSeller.textColor = new Color("#000000");
  ethNftPersonSeller.font = Font.semiboldSystemFont(15);

  ethNftPersonRow.addSpacer(16);

  // line2 -> card3 -> card3Row3
  const card3Row3 = card3.addStack();
  card3Row3.setPadding(12, 16, 14, 0);

  const card3Row3TextWrap = card3Row3.addStack();
  card3Row3TextWrap.layoutVertically();

  const top3Title = card3Row3TextWrap.addText(lanValue.top3);
  top3Title.textColor = new Color("#808080", 20);
  top3Title.font = Font.regularSystemFont(12);

  card3Row3TextWrap.addSpacer(4);

  const top3 = card3Row3TextWrap.addText(top3Data);
  top3.textColor = new Color("#000000");
  top3.font = Font.semiboldSystemFont(10);
}

function getNftTextColor(indexValue) {
  let colorCode = "";
  if (indexValue > 50) {
    colorCode = "#FF3939";
  } else {
    colorCode = "#27BDE6";
  }

  return colorCode;
}

async function fetchNftData() {
  try {
    const url = "https://api.nftgo.io/api/v1/data/overview";
    const req = new Request(url);
    const apiResult = await req.loadJSON();
    const nftIndex = apiResult.data.nftIndex ?? 0;
    const nftBuyer = apiResult.data.buyerNum24h ?? 0;
    const nftSeller = apiResult.data.sellerNum24h ?? 0;
    const nftVolume = apiResult.data.volume24h ?? 0;

    return { nftIndex, nftBuyer, nftSeller, nftVolume };
  } catch (error) {
    return { nftIndex: 0, nftBuyer: 0, nftSeller: 0, nftVolume: 0 };
  }
}

async function fetchTop3Data() {
  try {
    const url =
      "https://api.nftgo.io/api/v1/whales/data/list/whaleBought?by=WhaleNum&asc=-1&timeRank=12h&action=buy";
    const req = new Request(url);
    const apiResult = await req.loadJSON();
    const top3 = `${apiResult.data[0].coll.name} / ${apiResult.data[1].coll.name} / ${apiResult.data[2].coll.name}`;

    return top3;
  } catch (error) {
    return "";
  }
}

async function fetchGasFee() {
  try {
    const url = "https://mainnet.infura.io/v3/3f68aca40d2847feb19493bfbb343898";
    const req = new Request(url);
    req.method = "POST";
    req.headers = {
      "Content-Type": "application/json",
    };
    req.body = JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1,
    });

    const apiResult = await req.loadJSON();
    const gasFee = apiResult.result;

    return gasFee;
  } catch (error) {
    return 0;
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

function initLanguage() {
  const lan = Device.locale();
  let lanValue;

  const zh_CN = {
    followUs: "关注获取更多信息",
    nftIndex: "NFT 情绪指数",
    ethNftPrice: "以太坊交易额 (24H)",
    ethNftPerson: "全网多/空比",
    top3: "比特币市值占比",
  };

  const en = {
    followUs: "Follow Us",
    nftIndex: "NFT G-F Index",
    ethNftPrice: "Total Trade Volume ETH (24H)",
    ethNftPerson: "Total Traders (24H)",
    top3: "TOP 3 Whale Deals(12H)",
  };

  if (lan === "zh_CN") {
    lanValue = zh_CN;
  } else {
    lanValue = en;
  }
  return { lanValue };
}

// end of script
