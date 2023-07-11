import { useState } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button } from 'react-bootstrap';
import { create } from 'pinata-sdk';

const pinataApiKey = 'a0c524e05dec455b2804'; // Replace with your Pinata API Key
const pinataSecretApiKey = 'bbd485dfa74d344556e14ebda05813bec33a1da54b16420f59f166d5420321d3'; // Replace with your Pinata Secret API Key
const client = create(pinataApiKey, pinataSecretApiKey);

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const uploadToPinata = async (file) => {
    try {
      const result = await client.pinFileToIPFS(file);
      console.log(result);
      setImage(result.ipfsUrl);
    } catch (error) {
      console.log('Pinata image upload error:', error);
    }
  };

  const createNFT = async () => {
    if (!image || !price || !name || !description) return;

    try {
      const metadata = {
        name,
        description,
        image,
        price,
      };

      const result = await client.pinJSONToIPFS(metadata);
      const metadataURI = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      await mintThenList(metadataURI);
    } catch (error) {
      console.log('Pinata metadata upload error:', error);
    }
  };
  const mintThenList = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    await(await nft.mint(uri)).wait()
    const id = await nft.tokenCount()
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    const listingPrice = ethers.utils.parseEther(price.toString())
    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create