import React, { useState, useEffect } from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ABI from './Contract/BiFrost';
import CircularProgress from '@material-ui/core/CircularProgress';

const Mint = ({ethWallet, txzWallet}) => {

    const [step, setStep] = useState(1);
    const [whitelistedEthAddress, setWhiteListedEthAddress] = useState('');
    const [depositAmount, setDepositAmount] = useState(0);
    const [tezosAddress, setTezosAdress] = useState('Unlock Wallet');
    const [ethereumAddress, setEthereumAddress] = useState('Unlock Wallet');
    const [accounts, setAccounts] = useState([]);
    const [web3, setWeb3] = useState();
    const [tezosContract, setTezosContract] = useState();
    const [ethereumContract, setEthereumContract] = useState()
	const [loader, setLoader] = useState(false);

    useEffect(() => {
        setupAccounts();
    },[ethWallet,txzWallet])

    const setupAccounts = async() => {
        // ethereum address
        if(ethWallet) {
            const accounts = await ethWallet.web3.eth.getAccounts();
            setAccounts(accounts);
            setEthereumAddress(accounts[0]);
            setWhiteListedEthAddress(accounts[0]);

            // let provider = await ethWallet.infuraProvider();
            // console.log(provider);
            // setWeb3(provider);

            console.log(ABI);
            const instance = new ethWallet.web3.eth.Contract(
				ABI,
                "0x3A03B4EddF521a0Cb2bC761DD06A04F322eEe5F8",
                {
                    from:accounts[0]
                }
            );

            console.log(instance, "instance");
            setEthereumContract(instance);
        }
       
        if(txzWallet) {
            // tezos address
            const accountPkh = await txzWallet.wallet.pkh();
            setTezosAdress(accountPkh);

            console.log(accountPkh,"accountPkh");
            const bifrost = await txzWallet.wallet.at(
                "KT192uQ2Cjhr3Hgnf8438p3DxwhpdFrMTGyJ"
                ); 
            setTezosContract(bifrost);
        }
    }

    const callDepositEntryPoint = async() => {
		setLoader(true);
        try {  
            const operation = await tezosContract.methods.deposit(whitelistedEthAddress.toLowerCase()).send({ amount: depositAmount });
            await operation.confirmation();
        } catch (err) {
            console.error(err);
		}
		setLoader(false);
        setStep(2);
    }

    const callMintTokens = async() => {
		setLoader(true);
        try {
            const operation = await ethereumContract.methods.requestIfAddressWhitelisted().send({from:accounts[0]});
            console.log(operation);
        } catch(err) {
            console.error(err);
		}
        setLoader(false);
        setStep(1);
    }

    const box1 = {
        width:'100%',
        height:500,
        backgroundColor:'#FF6961',
        borderRadius:50,
        padding:30
    }

    return (
        <div style={box1}> 
        <Form>
            <Form.Group controlId="formTezosAddress">
                <Form.Label>Tezos Deposit Address</Form.Label>
                <Form.Control  placeholder={tezosAddress} readOnly/>
            </Form.Group>

            <Form.Group controlId="formXTZAmount">
                <Form.Label>Amount of XTZ</Form.Label>
                <Form.Control  placeholder="0" onChange={(e)=> {setDepositAmount(e.target.value)}}/>
                <Form.Text className="text-muted">
                    Creates {depositAmount/1.5} bXTZ on Ethereum
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="formEthAddress">
                <Form.Label>Ethereum Address Receiving bXTZ</Form.Label>
                <Form.Control  placeholder={ethereumAddress} readOnly/>
            </Form.Group>
        </Form>
        {(step ===1) ? loader ? <CircularProgress/> :
            <div style={{width:'100%', marginTop:30}}>
                <div>
                    <Button onClick={() => callDepositEntryPoint()} variant="info"  size="lg" style={{width:'50%'}}>
                        Deposit XTZ
                    </Button>
                </div>
                <div style={{marginTop: 20}}>
                    <Button  variant="outline-light" size="lg" style={{width:'50%'}} disabled>
                        Mint bXTZ
                    </Button>
                </div>

            </div>
            : loader ? <CircularProgress/> :
            <div style={{width:'100%', marginTop:30}}>
                <div>
                    <Button variant="outline-light" size="lg" style={{width:'50%'}} disabled>
                        Deposit XTZ
                    </Button>
                </div>
                <div style={{marginTop: 20}}>
                    <Button onClick={() => callMintTokens()} variant="info" size="lg" style={{width:'50%'}} >
                        Mint bXTZ
                    </Button>
                </div>

            </div>
        }
    </div>
    );
}

export default Mint;