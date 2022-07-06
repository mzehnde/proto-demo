import React from 'react';
import styled from 'styled-components';
import SendIcon from '@mui/icons-material/Send';
import { api, handleError } from '../helpers/api';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import EmailIcon from '@mui/icons-material/Email';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
//import {withRouter} from  'react-router-dom';

//TODO:
//LOCALLY:
//1. create nice html Email
//2. add info button with explanation
//3. after button: route /reward --> Email succesfull sent to...
//4. Backend: create /redeem with QRCodereward URL --> find reward by QRCode (consistent url to db) --> mark as redeemed DONE
//5. add check if redeemed
//6. frontend: route reward redemption DONE
//7. frontend: render form to insert sales DONE
//8. Backend: add sales generated to correct partner & to correct reward DONE
//9. Create two tables for reward --> crosspromot and normal --> check with qrcodeurl which repo to search
//9.1 --> when redeeming --> search through both repos to find --> never same qr url for reward!
//7. Test it locally by populating db with test entries

//DEPLOY
//1. Deploy on heroku --> consider: @origin, proxy, db...
//2. generate QR Codes and populate DB
//3. Test it
//4. Populate with real rewards
//5. Test again

//OTHER THINGS
//1. add reward descriptions for Mail!!!
//2. debug db warning
//3. new gmail account with "APP name"
//4. scale for phone

const API_URL = "https://eth-goerli.alchemyapi.io/v2/wR2HADjlUrTjeB-Rm7EKzWlL_6c6io2-"
const PUBLIC_KEY = "0x6Adc4066eBB891bC7c92397051A46C5301Cc6fd8"
const PRIVATE_KEY = "26a988e523d6e5defdd21917b5ef7c2541d698a22f84bc2e98238087a24e6bac"
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)
const contract = require("../artifacts/contracts/NFTRewards.sol/NFTRewards.json")
const contractAddress = "0x6dadaF4B1aDe44337Ae315C82Aa7e6f98758F230"
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

class Home extends React.Component{
    constructor() {
        super();
        this.state = {
            email:null
        };
    }

    async mintNFT(tokenURI) {
        const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

        //the transaction
        const tx = {
            from: PUBLIC_KEY,
            to: contractAddress,
            nonce: nonce,
            gas: 500000,
            data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
        }

        const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
        signPromise
            .then((signedTx) => {
                web3.eth.sendSignedTransaction(
                    signedTx.rawTransaction,
                    function (err, hash) {
                        if (!err) {
                            console.log(
                                "The hash of your transaction is: ",
                                hash,
                                "\nCheck Alchemy's Mempool to view the status of your transaction!"
                            )
                        } else {
                            console.log(
                                "Something went wrong when submitting your transaction:",
                                err
                            )
                        }
                    }
                )
            })
            .catch((err) => {
                console.log(" Promise failed:", err)
            })
    }

    handleInputChange(key, value) {
        // Example: if the key is username, this statement is the equivalent to the following one:
        // this.setState({'username': value});
        this.setState({ [key]: value });
    }

    componentDidMount() {
    }

    emailValidation(){
        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if(!this.state.email || regex.test(this.state.email) === false){
            this.setState({
                error: "Email is not valid"
            });
            return false;
        }
        return true;
    }

    onSubmit(){
        this.mintNFT("https://gateway.pinata.cloud/ipfs/QmVSk71DmVjjJSMbHcxKLxvR7wKYbbJX8rzJ2hFd4yFu8L")
        /*if(this.emailValidation()){
            this.sendReward();
        }*/
    }

    async sendReward() {

        try{
            const requestBody = JSON.stringify({
                emailAddress: this.state.email,
                kindOfReward: window.location.pathname
            });

            const response = await api.post('/test/sendReward', requestBody);

            console.log(response.data);
            window.location.href="/reward"

        } catch (error){
            alert(`Unfortunately there are no more rewards left!`);
        }
    }

    render(){
        const paperStyle = {padding: 10, height:'35vh', width:230, margin: '20px auto' }
        const mailStyle = {position: "center"}
        const buttonStyle = {position:"center"}

        return (
            <Grid alignItems="center">
                <Paper elevation={10} style={paperStyle}>
                    <EmailIcon fontSize="large" style={mailStyle}>

                    </EmailIcon>
                    <h2>
                        Register to receive a Reward
                    </h2>
                    <TextField label={"E-mail"}
                               placeholder={"Enter E-Mail here..."}
                               fullWidth required
                               onChange={e => {
                                   this.handleInputChange('email', e.target.value)}}
                    >
                    </TextField>
                    <span className="text-danger" >{this.state.error}</span>
                    <Button
                        /*onClick={() => {
                            this.sendEmail();
                        }}*/
                        onClick={
                            ()=>this.onSubmit()}
                        //disabled={!this.state.email}
                        style={buttonStyle}
                        type = 'submit' color = 'pink' variant = 'contained' endIcon={<SendIcon />}>
                        Claim Reward
                    </Button>
                </Paper>
            </Grid>
        );
    }
}

export default Home