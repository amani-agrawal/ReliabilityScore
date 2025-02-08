import parquet from 'parquetjs-lite';

interface SimpleTransaction {
  from: string;
  to: string;
  hash: string;
}

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
}

interface EtherscanProxyResponse {
  status: string;
  message: string;
  result: Transaction | null;
}

const schema = new parquet.ParquetSchema({
  from: { type: 'UTF8' },
  to:   { type: 'UTF8' },
  hash: { type: 'UTF8' }
});

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const chains: number[] = [480];

  const startBlockDec: number = 9822067;
  const endBlockDec: number = 9822070;

  const writer = await parquet.ParquetWriter.openFile(schema, 'transactions.parquet');

  for (const chain of chains) {
    console.log(`\nProcessing chain ${chain}`);
    for (let block = startBlockDec; block <= endBlockDec; block++) {
      const blockHex: string = '0x' + block.toString(16);
      console.log(`\nFetching transactions for block ${block} (${blockHex})`);
      let index = 0;
      let queryCount = 0; 
      while (true) {
        const indexHex: string = '0x' + index.toString(16);
        const url: string = `https://api.etherscan.io/v2/api?chainid=${chain}&module=proxy&action=eth_getTransactionByBlockNumberAndIndex&tag=${blockHex}&index=${indexHex}&apikey=53SU3USFB3C3ZYH5Y6S817SZCSST8FE1PT`;
        
        console.log(`Querying block ${block} transaction index ${index} (${indexHex})`);
        
        try {
          const queryResponse = await fetch(url);
          const data = await queryResponse.json() as EtherscanProxyResponse;
          if (!data.result) {
            console.log(`No transaction at index ${index} for block ${block}.`);
            break; 
          }
          const simpleTx: SimpleTransaction = {
            from: data.result.from,
            to: data.result.to,
            hash: data.result.hash
          };
          console.log(`Storing transaction: from ${simpleTx.from} to ${simpleTx.to}, hash ${simpleTx.hash}`);
          await writer.appendRow(simpleTx);

          queryCount++;
          if (queryCount % 5 === 0) {
            console.log("Reached 5 queries. Waiting for 1 minute...");
            await delay(60000);
          }
        } catch (error) {
          console.error(`Fetch error at block ${block}, index ${index}:`, error);
          break;
        }
        index++;
      }
    }
  }
  
  await writer.close();
  console.log('All transactions stored in transactions.parquet');
}

main().catch(err => console.error('Main error:', err));
