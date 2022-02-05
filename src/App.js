import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json'
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-isgbet1zjc';
const TOTAL_MINT_COUNT = 10;


const CONTRACT_ADDRESS = "0x02e4649909FC742398fc9eae14b1230CE9f37DFf";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [stat, setStat] = useState("ok")
  // Render Methods
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if(!ethereum){
      console.log("Make sure you have metamask!");
      return;
    }else{
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'})
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
      return;
    }

    if(accounts.length !== 0){
      const account = accounts[0]
      console.log("Found an authorized account", account);
      setCurrentAccount(account)

      setupEventListener() 
    }else{
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        alert("Get MetaMask!");
        return;
      }
      
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        return;
      }
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])

      setupEventListener() 
    }catch (error){
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try{
      const {ethereum} = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
      }else{
        console.log("Ethereum object doesn't exist");
      }
    }catch (error){
      console.log(error);
    }
  }

  const askContractToMintNFT = async () => {
    try{
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        const max = await connectedContract.getTotalNFTsMintedSoFar();

        if(parseInt(max) < TOTAL_MINT_COUNT){
          console.log("Going to pop wallet now to pay gas...");
          let nftTxn = await connectedContract.makeAnEpicNFT();

          console.log("Mining... please wait.");
          setStat('wait')
          await nftTxn.wait();
          setStat('ok')

          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        }else{
          throw new Error("NFT minted already maxed.");
        }
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch (error){
      console.log(error);
    }
  }

  const checkTotal = async () => {
    window.open(OPENSEA_LINK)
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>

          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>

          {currentAccount === "" ? renderNotConnectedContainer() : (
            <>
              {stat === 'ok' ? (
              <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
                Mint NFT
              </button>) : (
              <button className="cta-button connect-wallet-button" disabled>
                Waiting...
              </button>)}
              <br/>
              <br/>
              <button onClick={checkTotal} className="cta-button connect-wallet-button">
                CHECK!
              </button>
            </>
          )}

        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />

          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
