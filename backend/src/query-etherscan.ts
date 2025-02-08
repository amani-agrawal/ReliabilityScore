// If using Node 18+, the built-in fetch is available.
// For older versions, install node-fetch and import it.
// import fetch from 'node-fetch';

interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    input: string;
    // Add additional fields as needed.
  }
  
  interface EtherscanProxyResponse {
    status: string;
    message: string;
    result: Transaction | null;
  }
  
  async function main(): Promise<void> {
    // In this example, we are working on chain 480.
    const chains: number[] = [480];
  
    // Define the block number you want to query.
    const blockNumberDec: number = 9822067;
    // Convert the block number to hexadecimal.
    const blockNumberHex: string = '0x' + blockNumberDec.toString(16);
    
    // We'll start with the transaction at index 0.
    let index = 0;
  
    for (const chain of chains) {
      console.log(`\nFetching transactions for chain ${chain}, block ${blockNumberDec} (${blockNumberHex})`);
  
      // Iterate over transaction indices until no transaction is found.
      while (true) {
        const indexHex: string = '0x' + index.toString(16);
        const url: string = `https://api.etherscan.io/v2/api?chainid=${chain}&module=proxy&action=eth_getTransactionByBlockNumberAndIndex&tag=${blockNumberHex}&index=${indexHex}&apikey=`;
        
        console.log(`\nQuerying transaction index ${index} (${indexHex}):`);
        console.log(url);
        
        try {
          const queryResponse = await fetch(url);
          const data = await queryResponse.json() as EtherscanProxyResponse;
          
          if (!data.result) {
            console.error(`Chain ${chain} - No transaction found at index ${index}. Stopping iteration.`);
            break;
          }
          
          console.log(`Chain ${chain} - Transaction details for block ${blockNumberDec} index ${index}:`);
          console.log(data.result);
        } catch (error) {
          console.error(`Chain ${chain} - Fetch error at index ${index}:`, error);
          break;
        }
        
        index++;
      }
      
      // Reset the index if you're processing multiple chains.
      index = 0;
    }
  }
  
  main().catch(err => console.error('Main error:', err));
  