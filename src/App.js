import React, { useEffect, useState } from "react";
import './App.css';
import {ethers, providers} from "ethers"
import abi from "./utils/WavePortal.json"
import Spinner from "./layout/Spinner"



function App() {

  const contractAddress = "0x20cB97685Af5F150f246088b325e435b7DC591BA"
  const contractABI = abi.abi

  const [currentAccount, setCurrentAccount] = useState("")
  const [waveMessage, setWaveMessage] = useState("")
  const [allWaves, setAllWaves] = useState([])
  const [loading, setLoading] = useState(false)

  const checkifWalletIsConnected = async() =>{
    try {
      
    const {ethereum} = window

    if(!ethereum){
      console.log("Make sure you have metamask!")
      return
    }else{
      console.log("We have the ethereum object", ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves()

      } else {
        console.log("No authorized account found")
      }

    } catch (error) {
      console.log(error)
    }
  
  }

  useEffect(() =>{
    checkifWalletIsConnected()
  }, [])


  //function implement connect wallet button
  const connectWallet = async () =>{
    try {
      const {ethereum} = window

      if(!ethereum){
        alert("Get MetaMask!")
        return
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"})
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
      getAllWaves()

    } catch (error) {
      console.log(error)
    }
  }

  //function implement wave
  const wave = async () =>{
    try {
      if(!waveMessage){
        alert("would love a little message actually!")
        return
      }
      setLoading(true)
      const {ethereum} = window
      if(ethereum){

        //read total number of waves from blockchain
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
        let count = await wavePortalContract.getTotalWaves()
        console.log("Total waves received is :", count.toNumber())
        setWaveMessage("")
        //execute the actual wave from my the smart contract
        const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 300000 })
        console.log("Mining...", waveTxn.hash)
        await waveTxn.wait()
        console.log("Mined --", waveTxn.hash)

        //get the total wave count
        count = await wavePortalContract.getTotalWaves()
        console.log("Retreived total wave count...", count.toNumber())
        getAllWaves()
        setLoading(false)
      }else{
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  //get all waves
  const getAllWaves = async () =>{
    try {
      const {ethereum} = window
      if(ethereum){
          const provider = new ethers.providers.Web3Provider(ethereum)
          const signer = provider.getSigner()
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
          const waves = await wavePortalContract.getAllWaves()

          let wavesCleaned = []
          waves.forEach(wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            })
          })

          setAllWaves(wavesCleaned)

        // wavePortalContract.on(
        //   "NewWave", (from, timestamp, message) =>{

        //     console.log("NewWave", from, timestamp, message);
        //     setAllWaves(allWaves => [...allWaves, {
        //       address: from,
        //       timestamp: new Date(timestamp * 1000),
        //       message: message
        //     }])
        //   }
        // )

      }else{
        console.log("Ethereum object does not exit!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
      {loading && (<Spinner/>)}
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am Chima and I have worked on almost all technologies so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <div className="message">
        <form>  
            <textarea className="input"
              value={waveMessage} 
              onChange={(e) =>{
              setWaveMessage(e.target.value)
            }}
            placeholder= "A little heart warm message"
      
            />
         
        </form>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
              <div key= {index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
            )
        })}
      </div>
    </div>
  );
}

export default App;
