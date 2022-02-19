require("dotenv").config();
const Tx = require('ethereumjs-tx')
const Web3 = require("web3");
const axios = require('axios')
const { decodeConstructorArgs } = require('canoe-solidity');

const {
  ChainId,
  Fetcher,
  WETH,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Percent,
} = require("@pancakeswap-libs/sdk-v2");
const ethers = require("ethers");
const { parseEther } = require("ethers/lib/utils");

const chainId = ChainId.MAINNET;

let token;
let weth;
let provider;
let signer;
let uniswap;
let token_bal;
let total_supply;
let tokenSymbol;
let liquidity_amt;
let trans_hash;
let bnbamt;
let stats="";
let message;
let btax;
let stax;
let status_response_honeypot;
let perc;
	
let target_tokens;
let target_bnbs;

const SLIPPAGE = parseInt(process.env.SLIPPAGE)
const slippageTolerance = new Percent(SLIPPAGE, "100");
const ACCOUNT = process.env.ACCOUNT;
const EXCHANGE_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const GAS_GWEI = process.env.GAS_GWEI;
const GAS_LIMIT = process.env.GAS_LIMIT;
const ETH_AMOUNT = process.env.AMOUNT_TO_BUY;
const SELL_AT_X_TIMES = process.env.SELL_AT_PERCENT;
const TARGET_BNB = process.env.TARGET_BNB_LIQUIDITY_AMOUNT;
const TARGET_TOKEN = process.env.TARGET_TOKEN_LIQUIDITY_PERCENTAGE;
const TARGET_BUY_TAX=process.env.TARGET_BUY_TAX_PERCENTAGE;
const TARGET_SELL_TAX=process.env.TARGET_SELL_TAX_PERCENTAGE;

const web3 = new Web3(process.env.RPC_URL_WSS);
provider = new ethers.providers.getDefaultProvider(
  process.env.RPC_URL
);


const privateKey = new Buffer.from(process.env.PRIVATE_KEY, "hex");
signer = new ethers.Wallet(privateKey, provider);

let minABI =[
	{
	  "constant":true,
	  "inputs":[{"name":"_owner","type":"address"}],
	  "name":"balanceOf",
	  "outputs":[{"name":"balance","type":"uint256"}],
	  "type":"function"
	},
  
	{
	  "constant":true,
	  "inputs":[],
	  "name":"decimals",
	  "outputs":[{"name":"","type":"uint8"}],
	  "type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"name",
		"outputs":[{"name":"","type":"string"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"symbol",
		"outputs":[{"name":"","type":"string"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"amountETHMin",
		"outputs":[{"name":"","type":"uint256"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"amountTokenDesired",
		"outputs":[{"name":"","type":"uint256"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"totalSupply",
		"outputs":[{"name":"","type":"uint256"}],
		"type":"function"
	},
  ];

uniswap = new ethers.Contract(
  EXCHANGE_ADDRESS,
  [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
	"function approve(address spender, uint value) external returns (bool)",
  ],
  signer
);

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
