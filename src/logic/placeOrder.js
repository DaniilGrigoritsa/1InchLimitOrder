import {
    LimitOrderBuilder,
    Web3ProviderConnector,
} from '@1inch/limit-order-protocol';

const ABI = require("../abis/Contract.json");


const placeOrderLogic = async (web3, walletAddress, gasLimit, gasPrice, contractAddress, makingAmount, takingAmount, makerAssetAddress, takerAssetAddress, thresholdAmount, chainId) => {
    const makerAddress = walletAddress;

    const connector = new Web3ProviderConnector(web3);
    const contract = new web3.eth.Contract(ABI, contractAddress);
    
    const limitOrderBuilder = new LimitOrderBuilder(
        contractAddress,
        chainId,
        connector
    );
    
    const limitOrder = limitOrderBuilder.buildLimitOrder({
        makerAssetAddress: makerAssetAddress,
        takerAssetAddress: takerAssetAddress,
        makerAddress: makerAddress, 
        makerAmount: makingAmount.toString(),
        takerAmount: takingAmount.toString(),
        predicate: '0x0',
        permit: '0x0',
        interaction: '0x0',
    });

    const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(
        limitOrder
    );

    const signature = await limitOrderBuilder.buildOrderSignature(
        walletAddress,
        limitOrderTypedData
    );

    const order = {
        "salt": 1079264413041,
        "makerAsset": makerAssetAddress,
        "takerAsset": takerAssetAddress,
        "maker": makerAddress,
        "receiver": "0x0000000000000000000000000000000000000000",
        "allowedSender": walletAddress,
        "makingAmount": makingAmount,
        "takingAmount": takingAmount,
        "makerAssetData": "0x",
        "takerAssetData": "0x",
        "getMakerAmount": "0x", // ??
        "getTakerAmount": "0x", // ??
        "predicate": "0x",
        "permit": "0x",
        "interaction": "0x"
    }

    const data = contract.methods.fillOrder(order, signature, makingAmount, takingAmount, thresholdAmount).encodeABI();
    
    const nonce = await web3.eth.getTransactionCount(walletAddress, 'latest');
    
    const transaction = {
        'from': walletAddress,
        'to': contractAddress,
        'value': "0x00",
        'gasLimit': gasLimit.toString(), 
        'gasPrice': gasPrice.toString(),  
        'nonce': nonce.toString(),
        'data': data
    };
    
    await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      }).then((result) => {console.log(result)}).catch((error) => {console.log(error)});
      
    return order;
}

export default placeOrderLogic;